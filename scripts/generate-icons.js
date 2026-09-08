import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  // RGBA buffer (4 bytes per pixel) + 1 filter byte per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    const crc = calcCrc(combined);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Precompute CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function calcCrc(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // Color type 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflated);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Icon generator logic: Eye Care & Spectacles Logo in Teal & Emerald
function drawEyeIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Dark Slate #0f172a with subtle teal gradient
  const bgR = Math.round(15 + (dy / h) * 10);
  const bgG = Math.round(23 + ((x + y) / (2 * w)) * 25);
  const bgB = Math.round(42 + (dx / w) * 15);

  if (isMaskable) {
    // Maskable icons have full bleed background
  } else {
    // Standard icon has rounded corners
    const cornerR = w * 0.22;
    const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
    const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
    const distCorner = Math.sqrt(qx * qx + qy * qy);
    if (distCorner > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Draw Medical Cross / Glowing Eye Emblem in center safe-zone
  const scale = isMaskable ? 0.72 : 0.85;
  const nx = dx / (cx * scale);
  const ny = dy / (cy * scale);

  // Spectacles lenses: Left circle at nx = -0.38, Right circle at nx = +0.38, ny = -0.05
  const lensR = 0.32;
  const dLeft = Math.sqrt((nx + 0.4) * (nx + 0.4) + (ny + 0.05) * (ny + 0.05));
  const dRight = Math.sqrt((nx - 0.4) * (nx - 0.4) + (ny + 0.05) * (ny + 0.05));

  // Bridge between glasses
  const isBridge = (nx >= -0.4 && nx <= 0.4 && Math.abs(ny + 0.18) <= 0.045);

  // Lens frame ring
  const isLeftRing = Math.abs(dLeft - lensR) <= 0.045;
  const isRightRing = Math.abs(dRight - lensR) <= 0.045;

  // Eye Pupils in center of lenses
  const isLeftPupil = dLeft <= 0.12;
  const isRightPupil = dRight <= 0.12;
  const isLeftShine = Math.sqrt((nx + 0.44) * (nx + 0.44) + (ny + 0.09) * (ny + 0.09)) <= 0.04;
  const isRightShine = Math.sqrt((nx - 0.36) * (nx - 0.36) + (ny + 0.09) * (ny + 0.09)) <= 0.04;

  // Medical cross badge underneath or in center
  const isCrossH = Math.abs(ny - 0.45) <= 0.06 && Math.abs(nx) <= 0.28;
  const isCrossV = Math.abs(nx) <= 0.07 && ny >= 0.25 && ny <= 0.65;

  if (isLeftShine || isRightShine) {
    return [255, 255, 255, 255]; // Crisp white shine
  }
  if (isLeftPupil || isRightPupil) {
    return [45, 212, 191, 255]; // Teal 400 iris
  }
  if (isLeftRing || isRightRing || isBridge) {
    return [13, 148, 136, 255]; // Teal 600 frame
  }
  if (isCrossH || isCrossV) {
    return [16, 185, 129, 255]; // Emerald 500 medical plus
  }

  // Inner subtle lens glow
  if (dLeft < lensR) {
    const alpha = Math.max(0, 1 - dLeft / lensR);
    return [
      Math.round(bgR + alpha * 30),
      Math.round(bgG + alpha * 70),
      Math.round(bgB + alpha * 70),
      255
    ];
  }
  if (dRight < lensR) {
    const alpha = Math.max(0, 1 - dRight / lensR);
    return [
      Math.round(bgR + alpha * 30),
      Math.round(bgG + alpha * 70),
      Math.round(bgB + alpha * 70),
      255
    ];
  }

  return [bgR, bgG, bgB, 255];
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => drawEyeIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => drawEyeIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => drawEyeIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => drawEyeIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), createPng(64, 64, (x, y, w, h) => drawEyeIcon(x, y, w, h, false)));

// Write crisp vector SVG as well
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#134e4a"/>
    </linearGradient>
    <linearGradient id="tealG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#bg)"/>
  <!-- Spectacle Left Frame -->
  <circle cx="160" cy="220" r="90" fill="#0f766e" fill-opacity="0.25" stroke="#2dd4bf" stroke-width="18"/>
  <circle cx="160" cy="220" r="38" fill="#14b8a6"/>
  <circle cx="145" cy="205" r="12" fill="#ffffff"/>
  <!-- Spectacle Right Frame -->
  <circle cx="352" cy="220" r="90" fill="#0f766e" fill-opacity="0.25" stroke="#2dd4bf" stroke-width="18"/>
  <circle cx="352" cy="220" r="38" fill="#14b8a6"/>
  <circle cx="337" cy="205" r="12" fill="#ffffff"/>
  <!-- Spectacle Bridge -->
  <path d="M 235 205 Q 256 185 277 205" fill="none" stroke="#2dd4bf" stroke-width="18" stroke-linecap="round"/>
  <!-- Medical Plus / Care Badge -->
  <rect x="236" y="360" width="40" height="90" rx="10" fill="#10b981"/>
  <rect x="211" y="385" width="90" height="40" rx="10" fill="#10b981"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('PWA icons created successfully in public/ folder!');
