const mongoose = require('mongoose');

const medicalImageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  originalFileName: { type: String, required: true },
  imageType: { type: String, enum: ['MRI', 'CT', 'X-Ray', 'DICOM', 'Ultrasound', 'Other'], default: 'MRI' },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  encryptedFilePath: { type: String, required: true },
  originalHash: { type: String, required: true },
  encryptedHash: { type: String, required: true },
  encryptionStatus: { type: String, enum: ['encrypted', 'decrypted'], default: 'encrypted' },
  encryptionDurationMs: { type: Number, required: true },
  throughputKBps: { type: Number, default: 0 },
  senderPublicKey: { type: String, required: true },
  recipientPublicKey: { type: String, required: true },
  dicomMetadata: {
    isDicom: { type: Boolean, default: false },
    modality: { type: String, default: '' },
    headerMagic: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalImage', medicalImageSchema);
