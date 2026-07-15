/**
 * sketchEngine.js
 * Basic, dependency-light image-processing model for the four Sketchify AI
 * styles, built entirely on Jimp (pure JS, no native bindings, no separate
 * process/API to run). Runs in-process inside the Express server.
 *
 * This intentionally favors simplicity and portability over the heavier
 * OpenCV pipeline: no Python runtime, no extra Docker service, no network
 * hop between services. Swap the body of `applyStyle` for a real ML model
 * later without changing its signature (Buffer in -> Buffer out).
 */
const Jimp = require('jimp');

const MAX_DIMENSION = 1200; // cap resolution for predictable processing time

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function clampSetting(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Number(v)));
}

async function loadImage(buffer) {
  const img = await Jimp.read(buffer);
  if (img.bitmap.width > MAX_DIMENSION || img.bitmap.height > MAX_DIMENSION) {
    img.scaleToFit(MAX_DIMENSION, MAX_DIMENSION);
  }
  return img;
}

// Extract a plain grayscale luminance array (0-255) without mutating `img`.
function getGrayscale(img) {
  const { width, height, data } = img.bitmap;
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

// Separable box blur x3 ~ approximates a gaussian blur cheaply.
function boxBlur(src, w, h, radius) {
  if (radius < 1) return src.slice();
  let out = src;
  for (let pass = 0; pass < 3; pass++) out = boxBlurPass(out, w, h, radius);
  return out;
}

function boxBlurPass(src, w, h, radius) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const size = radius * 2 + 1;

  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / size;
      const addX = Math.min(w - 1, x + radius + 1);
      const subX = Math.max(0, x - radius);
      sum += src[y * w + addX] - src[y * w + subX];
    }
  }

  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / size;
      const addY = Math.min(h - 1, y + radius + 1);
      const subY = Math.max(0, y - radius);
      sum += tmp[addY * w + x] - tmp[subY * w + x];
    }
  }
  return out;
}

// Sobel edge magnitude, returned as a 0-255 Float32Array.
function sobelEdges(gray, w, h) {
  const out = new Float32Array(w * h);
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sx = 0, sy = 0, k = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const v = gray[(y + j) * w + (x + i)];
          sx += v * gx[k];
          sy += v * gy[k];
          k++;
        }
      }
      out[y * w + x] = clampByte(Math.sqrt(sx * sx + sy * sy));
    }
  }
  return out;
}

function applyBrightnessContrast(img, brightness, contrast) {
  const b = (brightness - 50) * 2; // -100..100
  const c = (contrast - 50) / 50; // -1..1
  const alpha = 1 + c;
  const { data } = img.bitmap;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampByte((data[i] - 128) * alpha + 128 + b);
    data[i + 1] = clampByte((data[i + 1] - 128) * alpha + 128 + b);
    data[i + 2] = clampByte((data[i + 2] - 128) * alpha + 128 + b);
  }
}

// ---------------------------------------------------------------------------
// Pencil sketch (classic grayscale color-dodge blend)
// ---------------------------------------------------------------------------
function pencilSketch(img, intensity, edgeSharpness) {
  const { width: w, height: h } = img.bitmap;
  const gray = getGrayscale(img);
  const inverted = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) inverted[i] = 255 - gray[i];

  const radius = Math.max(1, Math.round((intensity / 100) * 18) + 1);
  const blurred = boxBlur(inverted, w, h, radius);

  const edges = edgeSharpness > 0 ? sobelEdges(gray, w, h) : null;
  const edgeStrength = edgeSharpness / 100;

  const out = img.clone();
  const { data } = out.bitmap;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const denom = Math.max(1, 255 - blurred[p]);
    let val = clampByte((gray[p] / denom) * 255);
    if (edges) {
      const edgeVal = edges[p] > 60 ? 0 : 255; // dark line where an edge is detected
      val = clampByte(val * (1 - 0.35 * edgeStrength) + edgeVal * 0.35 * edgeStrength);
    }
    data[i] = data[i + 1] = data[i + 2] = val;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Colored sketch (keeps hue, softened pencil-style luminance)
// ---------------------------------------------------------------------------
function coloredSketch(img, intensity, edgeSharpness) {
  const pencil = pencilSketch(img, intensity, edgeSharpness);
  const out = img.clone();
  const { data } = out.bitmap;
  const pencilData = pencil.bitmap.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampByte(pencilData[i] * 0.55 + data[i] * 0.45);
    data[i + 1] = clampByte(pencilData[i + 1] * 0.55 + data[i + 1] * 0.45);
    data[i + 2] = clampByte(pencilData[i + 2] * 0.55 + data[i + 2] * 0.45);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Charcoal sketch (heavier blacks, textured strokes)
// ---------------------------------------------------------------------------
function charcoalSketch(img, intensity, edgeSharpness) {
  const pencil = pencilSketch(img, intensity, edgeSharpness);
  const { data } = pencil.bitmap;
  for (let i = 0; i < data.length; i += 4) {
    const darker = clampByte(data[i] * 1.15 - 25);
    const noise = (Math.random() - 0.5) * 14;
    const val = clampByte(darker + noise);
    data[i] = data[i + 1] = data[i + 2] = val;
  }
  return pencil;
}

// ---------------------------------------------------------------------------
// Cartoon sketch (posterized flat color + bold ink edges)
// ---------------------------------------------------------------------------
function cartoonSketch(img, intensity, edgeSharpness) {
  const { width: w, height: h } = img.bitmap;
  const smoothRadius = Math.max(1, Math.round((intensity / 100) * 5));
  const out = img.clone().blur(smoothRadius);

  const levels = Math.max(3, 8 - Math.round((edgeSharpness / 100) * 4));
  out.posterize(levels);

  const gray = getGrayscale(img);
  const edges = sobelEdges(gray, w, h);
  const threshold = 70;

  const { data } = out.bitmap;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (edges[p] > threshold) {
      data[i] = data[i + 1] = data[i + 2] = 15; // ink line
    }
  }
  return out;
}

const STYLE_MAP = {
  pencil: (img, s) => pencilSketch(img, s.intensity, s.edgeSharpness),
  colored: (img, s) => coloredSketch(img, s.intensity, s.edgeSharpness),
  charcoal: (img, s) => charcoalSketch(img, s.intensity, s.edgeSharpness),
  cartoon: (img, s) => cartoonSketch(img, s.intensity, s.edgeSharpness),
};

async function applyStyle(buffer, { style, intensity, contrast, brightness, edgeSharpness }) {
  if (!STYLE_MAP[style]) {
    throw new Error(`Unknown style '${style}'. Must be one of ${Object.keys(STYLE_MAP).join(', ')}`);
  }

  const settings = {
    intensity: clampSetting(intensity),
    contrast: clampSetting(contrast),
    brightness: clampSetting(brightness),
    edgeSharpness: clampSetting(edgeSharpness),
  };

  const img = await loadImage(buffer);
  const result = STYLE_MAP[style](img, settings);
  applyBrightnessContrast(result, settings.brightness, settings.contrast);

  return result.getBufferAsync(Jimp.MIME_PNG);
}

module.exports = { applyStyle };
