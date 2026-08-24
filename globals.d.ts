// Ambient declarations for side-effect imports that webpack/Next handle but
// TypeScript has no built-in type for. Next's own types only declare
// `*.module.css`; a plain `import "./globals.css"` needs a wildcard match
// here or the editor's (stricter) TS server reports:
//   "Cannot find module or type declarations for side-effect import."
declare module "*.css";
