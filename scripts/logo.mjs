// Renders the HimVolt mark to a square PNG for schema.org / OG / PWA use.
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8154"/>
      <stop offset="55%" stop-color="#ff5b38"/>
      <stop offset="100%" stop-color="#d63c1c"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" fill="#08090c"/>
  <path fill-rule="evenodd" fill="url(#g)" d="M8.4 2h15.2A6.4 6.4 0 0 1 30 8.4v15.2a6.4 6.4 0 0 1-6.4 6.4H8.4A6.4 6.4 0 0 1 2 23.6V8.4A6.4 6.4 0 0 1 8.4 2Zm9.1 4.6-8.7 11.1a.7.7 0 0 0 .55 1.13h4.32l-1.5 7.02a.7.7 0 0 0 1.24.56l8.86-11.2a.7.7 0 0 0-.55-1.13h-4.4l1.44-6.9a.7.7 0 0 0-1.26-.58Z"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/logo-512.png");
await sharp(Buffer.from(svg)).resize(32, 32).png().toFile("public/favicon-32.png");
console.log("logo written");
