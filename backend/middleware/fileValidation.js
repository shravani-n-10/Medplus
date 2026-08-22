const path = require('path');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = ['.dcm', '.png', '.jpg', '.jpeg', '.bmp', '.tif', '.tiff'];
const ALLOWED_MIME_TYPES = [
  'application/dicom',
  'application/octet-stream',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/tiff'
];

const validateMedicalImageUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded. Please choose a medical image.' });
  }

  const file = req.file;

  // 1. File size check
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({
      message: `File size exceeds limit of 50MB. Uploaded file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
    });
  }

  // 2. Extension check
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      message: `Invalid file extension '${ext}'. Allowed formats: DICOM (.dcm), PNG, JPG, JPEG, BMP, TIFF.`
    });
  }

  // 3. Magic Bytes / Header Validation
  const buffer = file.buffer;
  if (buffer.length < 4) {
    return res.status(400).json({ message: 'Corrupted or invalid file payload.' });
  }

  // Check PNG magic bytes: 89 50 4E 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  // Check JPEG magic bytes: FF D8 FF
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  // Check DICOM header magic: "DICM" at offset 128 (if buffer >= 132 bytes) or .dcm extension
  const isDicom = (buffer.length >= 132 && buffer.slice(128, 132).toString('ascii') === 'DICM') || ext === '.dcm';
  // Check BMP: 42 4D
  const isBmp = buffer[0] === 0x42 && buffer[1] === 0x4D;

  if (!isPng && !isJpeg && !isDicom && !isBmp) {
    return res.status(400).json({
      message: 'File signature magic bytes validation failed. The file is not a valid image or DICOM format.'
    });
  }

  next();
};

module.exports = validateMedicalImageUpload;
