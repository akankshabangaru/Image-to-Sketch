const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalUrl: { type: String, required: true },
    originalFileName: { type: String },
    originalSizeBytes: { type: Number },
    resultUrl: { type: String },
    style: {
      type: String,
      enum: ['pencil', 'colored', 'charcoal', 'cartoon'],
      default: 'pencil',
    },
    settings: {
      intensity: { type: Number, default: 60, min: 0, max: 100 },
      contrast: { type: Number, default: 50, min: 0, max: 100 },
      brightness: { type: Number, default: 50, min: 0, max: 100 },
      edgeSharpness: { type: Number, default: 50, min: 0, max: 100 },
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
    isFavorite: { type: Boolean, default: false },
    processingTimeMs: { type: Number },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

imageSchema.index({ user: 1, createdAt: -1 });
imageSchema.index({ style: 1 });

module.exports = mongoose.model('Image', imageSchema);
