const fs = require('fs');
const path = require('path');
const MedicalImage = require('../models/MedicalImage');
const AuditLog = require('../models/AuditLog');
const ECCEngine = require('../crypto/ecc');
const MedicalImageCryptoPipeline = require('../crypto/imageEncryption');

const UPLOADS_DIR = path.join(__dirname, '../uploads/encrypted');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const pipeline = new MedicalImageCryptoPipeline();

// Upload & Encrypt Medical Image
exports.uploadAndEncryptImage = async (req, res) => {
  try {
    const file = req.file;
    const { imageType } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No medical image file provided.' });
    }

    const senderKeys = {
      privateKey: req.user.ecdhPrivateKey,
      publicKey: req.user.ecdhPublicKey
    };

    // Recipient public key (system server / target recipient)
    const recipientKeyPair = ECCEngine.generateKeyPair();
    const recipientPublicKey = recipientKeyPair.publicKey;

    // Run 4-Stage Encryption Pipeline
    const encResult = pipeline.encrypt(file.buffer, senderKeys.privateKey, recipientPublicKey);

    // Save encrypted binary file to disk
    const fileNameSafe = `${Date.now()}_enc_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const encryptedFilePath = path.join(UPLOADS_DIR, fileNameSafe);
    fs.writeFileSync(encryptedFilePath, encResult.ciphertext);

    // Create MedicalImage metadata document (NO private keys stored in DB)
    const medicalImage = new MedicalImage({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      originalFileName: file.originalname,
      imageType: imageType || (encResult.dicomMetadata ? encResult.dicomMetadata.modality : 'MRI'),
      mimeType: file.mimetype || 'application/octet-stream',
      fileSize: file.size,
      encryptedFilePath: fileNameSafe,
      originalHash: encResult.originalHash,
      encryptedHash: encResult.encryptedHash,
      encryptionStatus: 'encrypted',
      encryptionDurationMs: encResult.durationMs,
      throughputKBps: encResult.throughputKBps,
      senderPublicKey: senderKeys.publicKey,
      recipientPublicKey: recipientPublicKey,
      dicomMetadata: encResult.dicomMetadata || { isDicom: false, modality: '', headerMagic: '' }
    });

    await medicalImage.save();

    // Log Audit Event
    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'IMAGE_ENCRYPTED',
      details: `Medical image '${file.originalname}' (${(file.size / 1024).toFixed(1)} KB) encrypted in ${encResult.durationMs} ms. SHA-256: ${encResult.encryptedHash.slice(0, 16)}...`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({
      message: 'Medical image successfully encrypted and securely stored!',
      image: medicalImage,
      stages: encResult.stages
    });
  } catch (error) {
    res.status(500).json({ message: 'Image encryption failed.', error: error.message });
  }
};

// Get User Encrypted Images List
exports.getMyImages = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const images = await MedicalImage.find(filter).sort({ createdAt: -1 });
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medical images.', error: error.message });
  }
};

// Get Image Metadata by ID
exports.getImageById = async (req, res) => {
  try {
    const image = await MedicalImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Medical image record not found.' });
    }
    res.json({ image });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch image details.', error: error.message });
  }
};

// Decrypt Authorized Image
exports.decryptImage = async (req, res) => {
  try {
    const image = await MedicalImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Medical image not found.' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && image.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to decrypt this image.' });
    }

    const fullFilePath = path.join(UPLOADS_DIR, image.encryptedFilePath);
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ message: 'Encrypted image file missing from storage.' });
    }

    const ciphertextBuffer = fs.readFileSync(fullFilePath);

    // Perform reverse 4-stage decryption using user's key context
    const recipientPrivateKey = req.user.ecdhPrivateKey;
    const decResult = pipeline.decrypt(ciphertextBuffer, recipientPrivateKey, image.senderPublicKey);

    // Verify SHA-256 hash match
    const isValid = decResult.restoredHash === image.originalHash;

    // Update status
    image.encryptionStatus = 'decrypted';
    await image.save();

    // Convert restored buffer to Base64 data URL for UI visual display
    let mimeType = image.mimeType;
    if (mimeType === 'application/octet-stream' || mimeType.includes('dicom')) {
      mimeType = 'image/png'; // Default display mime
    }
    const decryptedBase64 = `data:${mimeType};base64,${decResult.restoredBuffer.toString('base64')}`;

    // Create encrypted visual representation (noise matrix preview)
    const encryptedNoiseBase64 = `data:image/png;base64,${ciphertextBuffer.slice(0, 4000).toString('base64')}`;

    // Log Audit Event
    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'IMAGE_DECRYPTED',
      details: `Decrypted image '${image.originalFileName}' in ${decResult.durationMs} ms. Integrity Verified: ${isValid}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      message: 'Medical image successfully decrypted!',
      decryptedData: decryptedBase64,
      encryptedData: encryptedNoiseBase64,
      originalFileName: image.originalFileName,
      durationMs: decResult.durationMs,
      originalHash: image.originalHash,
      restoredHash: decResult.restoredHash,
      integrityVerified: isValid,
      dicomMetadata: image.dicomMetadata
    });
  } catch (error) {
    res.status(500).json({ message: 'Decryption failed.', error: error.message });
  }
};

// Download Decrypted File
exports.downloadDecryptedImage = async (req, res) => {
  try {
    const image = await MedicalImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Medical image record not found.' });
    }

    if (req.user.role !== 'admin' && image.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to download this file.' });
    }

    const fullFilePath = path.join(UPLOADS_DIR, image.encryptedFilePath);
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ message: 'Encrypted binary file not found on server.' });
    }

    const ciphertextBuffer = fs.readFileSync(fullFilePath);
    const decResult = pipeline.decrypt(ciphertextBuffer, req.user.ecdhPrivateKey, image.senderPublicKey);

    await AuditLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'IMAGE_DOWNLOADED',
      details: `Downloaded decrypted medical file '${image.originalFileName}'.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.setHeader('Content-Type', image.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${image.originalFileName}"`);
    res.send(decResult.restoredBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Download failed.', error: error.message });
  }
};
