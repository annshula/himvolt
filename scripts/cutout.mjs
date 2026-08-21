// Knocks the white studio background out of the CJ product photos and writes
// trimmed, transparent PNGs into public/product/cutout/.
// Alpha is derived from luminance: near-white -> transparent, everything else opaque.
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "public/product";
const OUT = path.join(SRC, "cutout");

// luma above HI is fully transparent, below LO fully opaque, smoothstep between.
const HI = 0.965;
const LO = 0.80;

const smooth = (t) => t * t * (3 - 2 * t);

async function cut(file) {
  const input = path.join(SRC, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    let a = 1;
    if (luma >= HI) a = 0;
    else if (luma > LO) a = 1 - smooth((luma - LO) / (HI - LO));
    out[o] = r; out[o + 1] = g; out[o + 2] = b;
    out[o + 3] = Math.round(a * 255);
  }

  const dest = path.join(OUT, file.replace(/\.jpe?g$/i, ".png"));
  const meta = await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9, palette: false })
    .toFile(dest);

  console.log(`${file} -> ${path.basename(dest)}  ${meta.width}x${meta.height}  ${(meta.size / 1024) | 0}kb`);
}

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f));
for (const f of files) await cut(f);
