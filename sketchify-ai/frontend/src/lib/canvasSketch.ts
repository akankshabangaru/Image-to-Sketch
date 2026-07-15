import type { SketchSettings, SketchStyle } from '@/types';

/**
 * Client-side canvas sketch preview.
 * Runs entirely in the browser for an instant, no-network preview the moment
 * settings change. The backend AI microservice (OpenCV) produces the final,
 * higher-quality result used for download/history - this is deliberately a
 * fast approximation, not the source of truth.
 */

function clampByte(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function getGrayscale(data: Uint8ClampedArray): Float32Array {
  const gray = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

// Simple separable box blur repeated 3x approximates a gaussian blur cheaply.
function boxBlur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  if (radius < 1) return src.slice();
  let out = src;
  for (let pass = 0; pass < 3; pass++) {
    out = boxBlurPass(out, w, h, radius);
  }
  return out;
}

function boxBlurPass(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const size = radius * 2 + 1;

  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
      sum += src[y * w + Math.min(w - 1, Math.max(0, x))];
    }
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / size;
      const addX = Math.min(w - 1, x + radius + 1);
      const subX = Math.max(0, x - radius);
      sum += src[y * w + addX] - src[y * w + subX];
    }
  }

  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    }
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / size;
      const addY = Math.min(h - 1, y + radius + 1);
      const subY = Math.max(0, y - radius);
      sum += tmp[addY * w + x] - tmp[subY * w + x];
    }
  }

  return out;
}

function applyBrightnessContrast(data: Uint8ClampedArray, brightness: number, contrast: number) {
  const b = (brightness - 50) * 2;
  const c = (contrast - 50) / 50 + 1;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampByte((data[i] - 128) * c + 128 + b);
    data[i + 1] = clampByte((data[i + 1] - 128) * c + 128 + b);
    data[i + 2] = clampByte((data[i + 2] - 128) * c + 128 + b);
  }
}

function pencilCore(imageData: ImageData, intensity: number, edgeSharpness: number, tint?: Uint8ClampedArray) {
  const { width: w, height: h, data } = imageData;
  const gray = getGrayscale(data);
  const inverted = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) inverted[i] = 255 - gray[i];

  const radius = Math.max(1, Math.round((intensity / 100) * 12) + 1);
  const blurred = boxBlur(inverted, w, h, radius);

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const denom = Math.max(1, 255 - blurred[p]);
    let val = clampByte((gray[p] / denom) * 255);

    // light edge boost proportional to edgeSharpness
    const strength = edgeSharpness / 100;
    val = clampByte(val * (1 - 0.2 * strength) + (val > 200 ? 255 : val) * 0.2 * strength);

    if (tint) {
      data[i] = clampByte((val / 255) * tint[0]);
      data[i + 1] = clampByte((val / 255) * tint[1]);
      data[i + 2] = clampByte((val / 255) * tint[2]);
    } else {
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }
}

function cartoonCore(imageData: ImageData, edgeSharpness: number) {
  const { width: w, height: h, data } = imageData;
  const levels = Math.max(3, 8 - Math.round((edgeSharpness / 100) * 4));
  const step = 255 / levels;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampByte(Math.round(data[i] / step) * step);
    data[i + 1] = clampByte(Math.round(data[i + 1] / step) * step);
    data[i + 2] = clampByte(Math.round(data[i + 2] / step) * step);
  }

  // Sobel edge overlay in black
  const gray = getGrayscale(data);
  const edgeOut = new Uint8ClampedArray(data.length);
  edgeOut.set(data);
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sx = 0, sy = 0, k = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i2 = -1; i2 <= 1; i2++) {
          const v = gray[(y + j) * w + (x + i2)];
          sx += v * gx[k];
          sy += v * gy[k];
          k++;
        }
      }
      const mag = Math.sqrt(sx * sx + sy * sy);
      const threshold = 90;
      if (mag > threshold) {
        const idx = (y * w + x) * 4;
        edgeOut[idx] = edgeOut[idx + 1] = edgeOut[idx + 2] = 15;
      }
    }
  }
  data.set(edgeOut);
}

export function renderSketchPreview(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  style: SketchStyle,
  settings: SketchSettings
) {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  targetCanvas.width = w;
  targetCanvas.height = h;

  const srcCtx = sourceCanvas.getContext('2d')!;
  const dstCtx = targetCanvas.getContext('2d')!;
  const imageData = srcCtx.getImageData(0, 0, w, h);
  const out = new ImageData(new Uint8ClampedArray(imageData.data), w, h);

  switch (style) {
    case 'pencil':
      pencilCore(out, settings.intensity, settings.edgeSharpness);
      break;
    case 'colored': {
      // approximate: soften + lighten toward pencil luminance while keeping hue
      const avg = new Uint8ClampedArray([210, 180, 150]);
      pencilCore(out, settings.intensity, settings.edgeSharpness);
      for (let i = 0; i < out.data.length; i += 4) {
        out.data[i] = clampByte(out.data[i] * 0.6 + imageData.data[i] * 0.4);
        out.data[i + 1] = clampByte(out.data[i + 1] * 0.6 + imageData.data[i + 1] * 0.4);
        out.data[i + 2] = clampByte(out.data[i + 2] * 0.6 + imageData.data[i + 2] * 0.4);
      }
      break;
    }
    case 'charcoal':
      pencilCore(out, settings.intensity, settings.edgeSharpness);
      for (let i = 0; i < out.data.length; i += 4) {
        out.data[i] = clampByte(out.data[i] * 0.85 - 12);
        out.data[i + 1] = clampByte(out.data[i + 1] * 0.85 - 12);
        out.data[i + 2] = clampByte(out.data[i + 2] * 0.85 - 12);
      }
      break;
    case 'cartoon':
      cartoonCore(out, settings.edgeSharpness);
      break;
  }

  applyBrightnessContrast(out.data, settings.brightness, settings.contrast);
  dstCtx.putImageData(out, 0, 0);
}

export function loadImageToCanvas(file: File, maxDim = 1200): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}
