// hero.jpg is a lifestyle shot with a burnt-in health claim across the top.
// Crop it away and keep the wrist + rock composition.
import sharp from "sharp";
await sharp("public/product/hero.jpg")
  .extract({ left: 0, top: 228, width: 675, height: 447 })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("public/product/worn.jpg");
console.log("worn.jpg written");
