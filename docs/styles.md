# Styling conventions

`src/styles/index.css` is the single entry. Load shared primitives and feature pages first, then intentional component variants and brand overrides. Font and wordmark definitions are last. Storefront styles stay under `.brand-app`; the legacy stylesheet loads only for the legacy entry.

- `styles/shared/base.css`: reset, typography, buttons, common layout, form primitives and accessibility.
- `styles/components`: shared header, navigation, footer, modal and wordmark.
- `styles/pages`: home, catalog, product, cart and checkout. `product-purchase.css` contains shared purchase declarations; `tile-product.css` is the FG/GH component variant.
- `brands/grandin-road/product.css` and `brands/garnet-hill/styles.css`: intentional brand differences. Brand configuration selects fonts, colors, spacing, header/home/purchase variants and navigation.
- `styles/tokens.css`: a small spacing scale and shared content width. Do not turn every measured pixel into a token.

Responsive boundaries currently preserve established behavior: compact phones at 480px, PDP stacking at 700px, general page stacking at 800px, navigation collapse at 1023px, and dense wide layouts at 1100/1199px. Their duplication within a file is consolidated where source order permits. Unifying page/PDP thresholds requires visual validation at intermediate widths; it is tracked as remaining debt rather than silently changing the established responsive layout during a structural refactor. CSS variables cannot be used natively in media-query conditions.

Never copy a complete page stylesheet to add a brand. Add a configuration value or scoped override for a measured difference. Keep production screenshot provenance and exact viewport alongside parity findings.
