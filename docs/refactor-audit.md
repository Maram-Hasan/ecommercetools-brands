# Architecture audit and staged plan

Audit date: 2026-09-25. Baseline working tree was clean. Reviewed all source areas, API and mapper tests, browser coverage, capture tooling, assets, and reference project shared PDP/header structure and FG/GR/GH style variables.

## Concrete issues

- `shared/storefronts.ts` combines two demo Stores, three storefront brands, and a mutating conversion that makes the server allowlist and demo selector depend on presentation compatibility.
- `src/App.tsx` is the old application; `src/brands/App.tsx` is the actual entry application. The latter also selects the legacy app, creates theme variables, parses routes, and renders the shell.
- Storefront cart state already has one provider. Its request revision guard is useful, but a refresh during mutation can still overwrite a successful mutation; public names such as `refreshLive` obscure its purpose.
- `src/services/commerce.ts` mixes HTTP, product/cart adaptation, full-catalog paging, and presentation copy. The server already maps SDK responses to DTOs: raw SDK objects do not reach React. Preserve that boundary.
- `slug: product.id` loses storefront identity. API products omit localized slugs, carts omit variant IDs and product slugs, and product numbers are displayed using SKU fallbacks.
- `src/shop` has no feature ownership. Shell combines navigation, header, dialogs, and footer; product details combines loading, gallery, options, purchase alternatives, and page content. Checkout is a long form component.
- `brand.css` exceeds 2,000 lines and combines every page, shell, primitives, and several generations of responsive overrides. PDP styles repeat shared purchase/gallery rules; GH depends on a file named for FG. Breakpoints include 700, 800, 1023, and 1100px.
- GH-specific checks are scattered in home/header. Classic PDP paths are unreachable with the three configured brands.
- README links to missing parity reports and mixes legacy setup with the storefront architecture. No production screenshots were present in this checkout.

## Target and sequence

1. `shared/brands/{types,frontgate,grandin-road,garnet-hill,index}.ts`; keep documented demo settings in `shared/legacy`, and API Store admission in `server/stores.ts`.
2. Composition-only `src/App.tsx`; `app` owns routing/layout, `brands` owns resolution/theme, and legacy UI is isolated. Keep the small history router: five route shapes do not require a new dependency.
3. Separate transport, catalog/cart services, normalized domain models, and mappers. Preserve UUID API reads for existing links while adding explicit slug reads. No UI strings in vendor mappers.
4. Keep and improve the existing shared cart provider, including stale-read protection and explicit removal. Server continues to own commercetools versions and returns conflicts for refresh/retry; never replay an add automatically.
5. Move components into catalog/product/cart/minicart/checkout/home; split meaningful responsibilities without barrel-only compatibility files.
6. Split style ownership, preserve cascade until checked, consolidate shared PDP structure, and document responsive boundaries.
   7–9. Review GR, FG, GH independently at desktop/tablet/mobile, using current accessible production evidence. Record unresolved comparisons instead of claiming parity.

## Risk and validation

Typecheck, existing API/domain tests, and browser smoke coverage gate each group. Slug resolution must respect Store selection and price context. Retain Store cookie isolation. Avoid automatic retry of cart writes. Verify navigation and CSS cascade at all three viewport sizes.

Production browser capture on this date returned Access Denied for all three homepages. Web retrieval supplied no usable page structure. Current production visual sign-off is blocked; reference source can substantiate layout conventions but cannot prove pixel parity. Missing FG/GH font assets, editorial content, responsive proportions, and every page's current production target remain explicit gaps.
