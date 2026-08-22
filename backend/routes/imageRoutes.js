const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validateMedicalImageUpload = require('../middleware/fileValidation');

// Configure Multer for memory buffer storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.use(authMiddleware);

router.post(
  '/upload-encrypt',
  upload.single('image'),
  validateMedicalImageUpload,
  imageController.uploadAndEncryptImage
);
router.get('/my-images', imageController.getMyImages);
router.get('/:id', imageController.getImageById);
router.post('/:id/decrypt', imageController.decryptImage);
router.get('/:id/download', imageController.downloadDecryptedImage);

module.exports = router;
