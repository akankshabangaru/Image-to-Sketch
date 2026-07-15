const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const {
  uploadImage,
  convertImage,
  getMyImages,
  getImage,
  toggleFavorite,
  deleteImage,
  getStorageStats,
} = require('../controllers/imageController');

const router = express.Router();

router.use(protect);

router.get('/stats/storage', getStorageStats);
router.get('/', getMyImages);
router.post('/upload', uploadLimiter, upload.single('image'), uploadImage);

router.post(
  '/:id/convert',
  [
    body('style').isIn(['pencil', 'colored', 'charcoal', 'cartoon']),
    body('intensity').optional().isInt({ min: 0, max: 100 }),
    body('contrast').optional().isInt({ min: 0, max: 100 }),
    body('brightness').optional().isInt({ min: 0, max: 100 }),
    body('edgeSharpness').optional().isInt({ min: 0, max: 100 }),
  ],
  validate,
  convertImage
);

router.get('/:id', getImage);
router.patch('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteImage);

module.exports = router;
