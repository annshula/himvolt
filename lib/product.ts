/**
 * Product model. Shape mirrors a Shopify Storefront `Product` closely enough
 * that `lib/shopify.ts` can drop straight in later — the components only ever
 * read from this interface.
 *
 * Source: CJDropshipping SPU CJSL2782519 ("Square Black Tourmaline Bracelet
 * Mens Elastic Mixed-Style Bracelet"), 20cm / 7.87in, 40g per piece.
 */

export type Money = { amount: number; currencyCode: string };

export type Variant = {
  id: string;
  sku: string;
  title: string;
  subtitle: string;
  quantity: number;
  price: Money;
  compareAtPrice?: Money;
  badge?: string;
  image: string;
  availableForSale: boolean;
  weightGrams: number;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  descriptionHtml: string;
  material: string;
  gallery: { src: string; alt: string; width: number; height: number }[];
  specs: { label: string; value: string }[];
  variants: Variant[];
};

const usd = (amount: number): Money => ({ amount, currencyCode: "USD" });

export const product: Product = {
  id: "gid://himvolt/Product/1",
  handle: "the-tourmaline-band",
  title: "The Tourmaline Band",
  subtitle: "Square-cut black tourmaline · elastic fit",
  material: "Natural black tourmaline (schorl)",
  descriptionHtml:
    "<p>Sixteen square-cut black tourmaline stones, hand-polished and strung on a double-corded elastic core. No clasp, no hardware, nothing to break. 20cm relaxed, stretches to fit a 16–21cm wrist.</p>",

  gallery: [
    { src: "/product/cutout/detail-3.png", alt: "The Tourmaline Band laid flat, showing all sixteen square-cut stones", width: 1383, height: 914 },
    { src: "/product/cutout/single.png", alt: "The Tourmaline Band at an angle, showing the polished square faces", width: 865, height: 1342 },
    { src: "/media/wear.jpg", alt: "The Tourmaline Band worn on a man's wrist", width: 2000, height: 1116 },
    { src: "/product/cutout/pair.png", alt: "Two Tourmaline Bands side by side", width: 1529, height: 1648 },
  ],

  specs: [
    { label: "Stone", value: "Natural black tourmaline (schorl)" },
    { label: "Cut", value: "Square barrel, 16 stones" },
    { label: "Hardness", value: "7–7.5 Mohs — harder than steel" },
    { label: "Length", value: "20 cm / 7.87 in relaxed" },
    { label: "Fits", value: "16–21 cm wrist (6.3–8.3 in)" },
    { label: "Weight", value: "40 g" },
    { label: "Core", value: "Double-corded stretch elastic" },
    { label: "Finish", value: "Hand-polished, unwaxed" },
  ],

  variants: [
    {
      id: "gid://himvolt/ProductVariant/1",
      sku: "CJSL278251902BY",
      title: "One band",
      subtitle: "The everyday",
      quantity: 1,
      price: usd(39),
      compareAtPrice: usd(59),
      image: "/product/cutout/single.png",
      availableForSale: true,
      weightGrams: 40,
    },
    {
      id: "gid://himvolt/ProductVariant/2",
      sku: "CJSL278251901AZ",
      title: "Two bands",
      subtitle: "Stack, or gift one",
      quantity: 2,
      price: usd(66),
      compareAtPrice: usd(118),
      badge: "Most bought",
      image: "/product/cutout/pair.png",
      availableForSale: true,
      weightGrams: 74,
    },
    {
      id: "gid://himvolt/ProductVariant/3",
      sku: "CJSL278251903CX",
      title: "Four bands",
      subtitle: "The squad pack",
      quantity: 4,
      price: usd(116),
      compareAtPrice: usd(236),
      badge: "Best value",
      image: "/product/cutout/four.png",
      availableForSale: true,
      weightGrams: 148,
    },
  ],
};

export const formatMoney = (m: Money) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
    minimumFractionDigits: m.amount % 1 === 0 ? 0 : 2,
  }).format(m.amount);

export const unitPrice = (v: Variant) => usd(v.price.amount / v.quantity);

export const savingsPercent = (v: Variant) =>
  v.compareAtPrice
    ? Math.round((1 - v.price.amount / v.compareAtPrice.amount) * 100)
    : 0;
