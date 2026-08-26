// Regenerates every brand asset from the source logo masters in assets/brand/.
// Run with: node scripts/logo.mjs
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const SRC = "assets/brand";
const OUT = "public";
const DARK_BG = "#0a0a0a"; // brand pitch — used behind the favicon/app icons

const black = `${SRC}/himvolt_logo_black.png`;
const white = `${SRC}/himvolt_logo_white.png`;

/** Build a multi-size, PNG-compressed .ico (supported by all modern browsers). */
async function buildIco(pngBuffer, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4); // image count

  const entries = [];
  const payloads = [];
  let offset = 6 + 16 * sizes.length;

  for (const s of sizes) {
    const png = await sharp(pngBuffer).resize(s, s).png().toBuffer();
    payloads.push(png);
    const e = Buffer.alloc(16);
    e[0] = s >= 256 ? 0 : s; // width
    e[1] = s >= 256 ? 0 : s; // height
    e[2] = 0; // palette
    e[3] = 0; // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8); // bytes in resource
    e.writeUInt32LE(offset, 12); // image data offset
    offset += png.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...payloads]);
}

async function run() {
  await mkdir(OUT, { recursive: true });
  await mkdir("app", { recursive: true });

  // ── In-page logos — WebP is the smallest format browsers support. ──────
  await sharp(black)
    .resize(512, 512)
    .webp({ quality: 90 })
    .toFile(`${OUT}/logo-black.webp`);
  await sharp(white)
    .resize(512, 512)
    .webp({ quality: 90 })
    .toFile(`${OUT}/logo-white.webp`);

  // schema.org / OG logo — a solid mark that reads on any card.
  await sharp(white)
    .resize(512, 512)
    .flatten({ background: DARK_BG })
    .webp({ quality: 90 })
    .toFile(`${OUT}/logo-512.webp`);

  // ── Favicon + app icons — Next.js file conventions in app/, so Next
  //    auto-serves <link rel="icon"> / <link rel="apple-touch-icon">. ─────
  const onDark = sharp(white).flatten({ background: DARK_BG });
  await writeFile(
    "app/favicon.ico",
    await buildIco(await onDark.clone().png().toBuffer(), [16, 32, 48]),
  );
  await onDark.clone().resize(32, 32).png().toFile("app/icon.png");
  await onDark.clone().resize(180, 180).png().toFile("app/apple-icon.png");

  // ── PWA manifest icons (PNG is required by installable PWAs). ──────────
  await onDark.clone().resize(192, 192).png().toFile(`${OUT}/icon-192.png`);
  await onDark.clone().resize(512, 512).png().toFile(`${OUT}/icon-512.png`);

  console.log("✓ brand assets written to app/ and", OUT);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
