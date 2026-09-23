/**
 * Blurhash (https://blurha.sh) for uploaded images — TRI-160.
 *
 * No image library is installed here (sharp is only a transitive optional dep of next and is not
 * resolvable from app code), so the pixels come from Cloudinary: a 32px `f_bmp` rendition of the
 * asset is a ~2 KB uncompressed 24/32-bit bitmap that decodes in a few lines. The encoder is the
 * reference algorithm (4x3 components), written out here rather than pulling in the `blurhash`
 * package.
 */

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

export const BLURHASH_THUMB_TRANSFORMATION = "w_32,h_32,c_limit,f_bmp";

type Pixels = { width: number; height: number; rgb: Uint8Array };

function encode83(value: number, length: number): string {
  let out = "";
  for (let i = 1; i <= length; i++) {
    const digit = Math.floor(value / Math.pow(83, length - i)) % 83;
    out += ALPHABET[digit];
  }
  return out;
}

function sRGBToLinear(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearTosRGB(value: number): number {
  const v = Math.max(0, Math.min(1, value));
  return v <= 0.0031308
    ? Math.round(v * 12.92 * 255 + 0.5)
    : Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
}

function signPow(value: number, exp: number): number {
  return Math.sign(value) * Math.pow(Math.abs(value), exp);
}

/** Reference blurhash encoder over packed RGB bytes (3 per pixel, row-major, top-down). */
export function encodeBlurhash(pixels: Pixels, componentX = 4, componentY = 3): string {
  const { width, height, rgb } = pixels;
  if (componentX < 1 || componentX > 9 || componentY < 1 || componentY > 9) {
    throw new Error("blurhash components must be between 1 and 9");
  }
  if (rgb.length !== width * height * 3) {
    throw new Error("blurhash pixel buffer does not match width * height * 3");
  }

  // Linearise once; every component walks the same pixels.
  const linear = new Float32Array(rgb.length);
  for (let i = 0; i < rgb.length; i++) linear[i] = sRGBToLinear(rgb[i]);

  const factors: [number, number, number][] = [];
  for (let y = 0; y < componentY; y++) {
    for (let x = 0; x < componentX; x++) {
      const normalisation = x === 0 && y === 0 ? 1 : 2;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let py = 0; py < height; py++) {
        const cy = Math.cos((Math.PI * y * py) / height);
        for (let px = 0; px < width; px++) {
          const basis = normalisation * Math.cos((Math.PI * x * px) / width) * cy;
          const i = (py * width + px) * 3;
          r += basis * linear[i];
          g += basis * linear[i + 1];
          b += basis * linear[i + 2];
        }
      }
      const scale = 1 / (width * height);
      factors.push([r * scale, g * scale, b * scale]);
    }
  }

  const [dc, ...ac] = factors;
  let hash = encode83((componentX - 1) + (componentY - 1) * 9, 1);

  let maximumValue: number;
  if (ac.length > 0) {
    const actualMax = Math.max(...ac.map((f) => Math.max(Math.abs(f[0]), Math.abs(f[1]), Math.abs(f[2]))));
    const quantisedMax = Math.max(0, Math.min(82, Math.floor(actualMax * 166 - 0.5)));
    maximumValue = (quantisedMax + 1) / 166;
    hash += encode83(quantisedMax, 1);
  } else {
    maximumValue = 1;
    hash += encode83(0, 1);
  }

  hash += encode83((linearTosRGB(dc[0]) << 16) + (linearTosRGB(dc[1]) << 8) + linearTosRGB(dc[2]), 4);

  for (const [r, g, b] of ac) {
    const quant = (v: number) => Math.max(0, Math.min(18, Math.floor(signPow(v / maximumValue, 0.5) * 9 + 9.5)));
    hash += encode83(quant(r) * 19 * 19 + quant(g) * 19 + quant(b), 2);
  }

  return hash;
}

/** Decode an uncompressed 24- or 32-bit BMP (what Cloudinary's `f_bmp` produces) into packed RGB. */
export function decodeBmp(buffer: Buffer): Pixels {
  if (buffer.length < 54 || buffer.toString("ascii", 0, 2) !== "BM") {
    throw new Error("not a BMP file");
  }
  const dataOffset = buffer.readUInt32LE(10);
  const headerSize = buffer.readUInt32LE(14);
  const width = buffer.readInt32LE(18);
  const rawHeight = buffer.readInt32LE(22);
  const bitsPerPixel = buffer.readUInt16LE(28);
  const compression = buffer.readUInt32LE(30);
  // 0 = BI_RGB, 3 = BI_BITFIELDS (32-bit with masks, still byte-aligned BGRA in practice)
  if (headerSize < 40 || (compression !== 0 && compression !== 3) || (bitsPerPixel !== 24 && bitsPerPixel !== 32)) {
    throw new Error(`unsupported BMP (bpp ${bitsPerPixel}, compression ${compression})`);
  }
  const topDown = rawHeight < 0;
  const height = Math.abs(rawHeight);
  const bytesPerPixel = bitsPerPixel / 8;
  const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
  if (buffer.length < dataOffset + rowSize * height) {
    throw new Error("truncated BMP");
  }

  const rgb = new Uint8Array(width * height * 3);
  for (let row = 0; row < height; row++) {
    const srcRow = topDown ? row : height - 1 - row;
    const rowStart = dataOffset + srcRow * rowSize;
    for (let x = 0; x < width; x++) {
      const src = rowStart + x * bytesPerPixel;
      const dst = (row * width + x) * 3;
      rgb[dst] = buffer[src + 2];
      rgb[dst + 1] = buffer[src + 1];
      rgb[dst + 2] = buffer[src];
    }
  }
  return { width, height, rgb };
}

/** `…/image/upload/<transformation>/v123/x.jpg` from a Cloudinary delivery URL; null if not one. */
export function cloudinaryThumbUrl(secureUrl: string, transformation = BLURHASH_THUMB_TRANSFORMATION): string | null {
  const marker = "/image/upload/";
  const at = secureUrl.indexOf(marker);
  if (at === -1) return null;
  return `${secureUrl.slice(0, at + marker.length)}${transformation}/${secureUrl.slice(at + marker.length)}`;
}

/**
 * Blurhash for a Cloudinary image, or null when the thumbnail cannot be fetched or decoded. Never
 * throws: a missing placeholder must not fail an upload.
 */
export async function blurhashForCloudinaryImage(secureUrl: string): Promise<string | null> {
  const url = cloudinaryThumbUrl(secureUrl);
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      console.warn(`blurhash: thumbnail fetch failed ${response.status} for ${url}`);
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return encodeBlurhash(decodeBmp(buffer));
  } catch (error) {
    console.warn("blurhash: could not compute placeholder", error instanceof Error ? error.message : error);
    return null;
  }
}
