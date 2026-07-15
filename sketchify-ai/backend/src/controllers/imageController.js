const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const Image = require('../models/Image');
const User = require('../models/User');
const { UPLOAD_DIR } = require('../middleware/upload');
const { applyStyle } = require('../services/sketchEngine');
const logger = require('../config/logger');

// @desc    Upload an image (creates the DB record; conversion is triggered separately)
// @route   POST /api/images/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const image = await Image.create({
    user: req.user._id,
    originalUrl: fileUrl,
    originalFileName: req.file.originalname,
    originalSizeBytes: req.file.size,
    status: 'uploaded',
  });

  req.user.storageUsedBytes += req.file.size;
  await req.user.save();

  res.status(201).json({ success: true, image });
});

// @desc    Convert an uploaded image to a sketch via the AI microservice
// @route   POST /api/images/:id/convert
// @access  Private
const convertImage = asyncHandler(async (req, res) => {
  const { style = 'pencil', intensity = 60, contrast = 50, brightness = 50, edgeSharpness = 50 } =
    req.body;

  const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  image.status = 'processing';
  image.style = style;
  image.settings = { intensity, contrast, brightness, edgeSharpness };
  await image.save();

  const startedAt = Date.now();

  try {
    const filePath = path.join(UPLOAD_DIR, path.basename(image.originalUrl));
    const inputBuffer = fs.readFileSync(filePath);

    // Runs in-process - no separate service, no network hop.
    const resultBuffer = await applyStyle(inputBuffer, {
      style,
      intensity,
      contrast,
      brightness,
      edgeSharpness,
    });

    const resultFileName = `sketch-${Date.now()}-${path.basename(image.originalUrl, path.extname(image.originalUrl))}.png`;
    const resultPath = path.join(UPLOAD_DIR, resultFileName);
    fs.writeFileSync(resultPath, resultBuffer);

    image.resultUrl = `/uploads/${resultFileName}`;
    image.status = 'completed';
    image.processingTimeMs = Date.now() - startedAt;
    await image.save();

    res.status(200).json({ success: true, image });
  } catch (err) {
    logger.error(`Sketch conversion failed for image ${image._id}: ${err.message}`);
    image.status = 'failed';
    image.errorMessage = err.message;
    await image.save();
    res.status(500);
    throw new Error('Sketch processing failed. Please try again.');
  }
});

// @desc    List the current user's images (with search/filter/pagination)
// @route   GET /api/images
// @access  Private
const getMyImages = asyncHandler(async (req, res) => {
  const { search, style, favorite, status, page = 1, limit = 12 } = req.query;

  const query = { user: req.user._id };
  if (search) query.originalFileName = { $regex: search, $options: 'i' };
  if (style) query.style = style;
  if (favorite === 'true') query.isFavorite = true;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [images, total] = await Promise.all([
    Image.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Image.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    images,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get a single image
// @route   GET /api/images/:id
// @access  Private
const getImage = asyncHandler(async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }
  res.status(200).json({ success: true, image });
});

// @desc    Toggle favorite
// @route   PATCH /api/images/:id/favorite
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }
  image.isFavorite = !image.isFavorite;
  await image.save();
  res.status(200).json({ success: true, image });
});

// @desc    Delete an image (and its files)
// @route   DELETE /api/images/:id
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  [image.originalUrl, image.resultUrl].filter(Boolean).forEach((url) => {
    const filePath = path.join(UPLOAD_DIR, path.basename(url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  if (image.originalSizeBytes) {
    req.user.storageUsedBytes = Math.max(0, req.user.storageUsedBytes - image.originalSizeBytes);
    await req.user.save();
  }

  await image.deleteOne();
  res.status(200).json({ success: true, message: 'Image deleted' });
});

// @desc    Storage usage stats for the current user
// @route   GET /api/images/stats/storage
// @access  Private
const getStorageStats = asyncHandler(async (req, res) => {
  const [totalImages, completedImages, favoriteImages] = await Promise.all([
    Image.countDocuments({ user: req.user._id }),
    Image.countDocuments({ user: req.user._id, status: 'completed' }),
    Image.countDocuments({ user: req.user._id, isFavorite: true }),
  ]);

  const planLimits = { free: 500 * 1024 * 1024, pro: 10 * 1024 * 1024 * 1024, business: 100 * 1024 * 1024 * 1024 };

  res.status(200).json({
    success: true,
    stats: {
      totalImages,
      completedImages,
      favoriteImages,
      storageUsedBytes: req.user.storageUsedBytes,
      storageLimitBytes: planLimits[req.user.plan] || planLimits.free,
    },
  });
});

module.exports = {
  uploadImage,
  convertImage,
  getMyImages,
  getImage,
  toggleFavorite,
  deleteImage,
  getStorageStats,
};
