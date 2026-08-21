// The supplier's "4pcs" photo is one bracelet with a red "4pcs" label burnt in.
// Build an honest four-band image instead by tiling the two-band cutout.
import sharp from "sharp";

const src = "public/product/cutout/pair.png";
const { width, height } = await sharp(src).metadata();

const W = Math.round(width * 0.62);
const H = Math.round(height * 0.62);
const overlap = Math.round(W * 0.24);
const tile = await sharp(src).resize(W, H).png().toBuffer();

await sharp({
  create: {
    width: W * 2 - overlap,
    height: H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: tile, left: 0, top: 0 },
    { input: tile, left: W - overlap, top: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/product/cutout/four.png");

const out = await sharp("public/product/cutout/four.png").metadata();
console.log(`four.png ${out.width}x${out.height}`);
