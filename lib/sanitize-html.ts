import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes merchant-controlled rich text (Shopify product descriptionHtml)
 * before it reaches `dangerouslySetInnerHTML`. Shopify content is trusted
 * but not verified, so this strips scripts/event handlers/dangerous URLs
 * regardless.
 *
 * Was `isomorphic-dompurify` (DOMPurify + jsdom) with `USE_PROFILES: { html:
 * true }`. Replaced because jsdom's dependency tree pulls in `@exodus/bytes`
 * — a pure-ESM package that multiple of jsdom's own dependencies (
 * `html-encoding-sniffer`, `whatwg-url`, and jsdom's own api.js) `require()`
 * synchronously. Every published version of `@exodus/bytes` ships this way,
 * so it isn't a version to pin around — it crashed hard on Vercel's Node
 * runtime (`ERR_REQUIRE_ESM`) despite working fine locally, and each
 * dependency hitting it was a separate whack-a-mole crash. `sanitize-html`
 * (htmlparser2-based, no jsdom anywhere in its tree) covers the same rich-
 * text sanitization need without carrying that risk.
 */
export function sanitizeProductHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "span",
      "div",
      "u",
      "s",
      "sup",
      "sub",
      "figure",
      "figcaption",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading", "srcset", "sizes"],
      a: ["href", "name", "target", "rel"],
      "*": ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
