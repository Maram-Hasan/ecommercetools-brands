# Production visual parity assessment

**Status: blocked; no FG, GR or GH page is signed off against current production.**

The architectural refactor and local visual regression review are separate from production fidelity. The user requested high fidelity, and missing evidence cannot be treated as a pass.

## Evidence collected on 2026-09-25

- Browser captures of Frontgate, Grandin Road and Garnet Hill homepages returned Access Denied. Captured JSON and denial screenshots are in `test-results/production-reference`. The GR Wreath Storage Bag PDP at `https://www.grandinroad.com/wreath-storage-bag/1107747` also returned Access Denied.
- No archived production image files were present in this checkout. The old report generator referenced filenames that did not exist; it now reports the gap instead of presenting broken images as evidence.
- Reference project: reviewed shared universal PDP/header structure and each brand's typography/grid variables. Existing logos and fonts retain the provenance documented in `public/ASSETS.md`. The reference project supports source-level conventions and dimensions, not a current production screenshot claim.
- Local captures cover 7 pages × 3 brands × 3 viewport sizes: 1440×1000 desktop, 820×1180 tablet, and 390×844 mobile. Cart/minicart/checkout captures use one browser-only line item from live Store data; no remote cart writes occur.
- The indexed [GR Wreath Storage Bag page](https://www.grandinroad.com/wreath-storage-bag/ships-free/seasonal/1107747?defattrib=Color&defattribvalue=BLA&uniqueId=1107747) exposes a production item number, multiple color-image options, and more detailed product content than the POC. This supports a content mismatch finding, not geometry, typography or responsive measurements.

## Brand-specific findings

| Brand | Preserved or corrected locally                                                                                                                                                                                                                                                         | Remaining production comparison                                                                                                                                                                                                                                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GR    | Compact utility/header/main/secondary navigation, vertical thumbnail rail, contained product image, visual swatches, selected state, quantity/total, full-width navy CTA. Shared CSS extraction now preserves responsive specificity. SKU is no longer mislabeled as a product number. | Exact header height/logo/search positioning, nav density, breadcrumb spacing, gallery image scale, info-column/title/price alignment, swatch assets, footer, mobile/tablet proportions. POC Wreath Storage Bag data has fewer options/content than the indexed production page. Product number must come from catalog data, not parsing SKU. |
| FG    | Dedicated header, black CTA, tile option presentation, selected-option image/price/availability behavior, responsive gallery. Shared tile classes no longer pretend to belong only to FG.                                                                                              | Current font assets, header/nav measurements, home editorial content and images, PDP proportions, option texture/grouping, footer and intermediate widths.                                                                                                                                                                                   |
| GH    | Dedicated editorial homepage/header/footer, Kepler heading asset, taupe controls, brand-scoped overrides of shared tile purchase structure.                                                                                                                                            | Production body font, editorial content/assets, exact navigation/spacing, and a GH PDP reference to determine whether the shared purchase composition needs a structural override. Mobile/tablet remain responsive adaptations.                                                                                                              |

Reviews, ratings and promotional business logic remain deferred as requested. No fake integration was added. Existing placeholder demo checkout content cannot match production order/payment flows and remains explicitly labeled.

## Review artifacts

- `test-results/visual-parity/index.html`: interactive local before/after comparison.
- `test-results/visual-parity/{before,after}/manifest.json`: page/viewport measurements, broken images and overflow.
- `test-results/visual-parity/geometry-diff.json`: changed measured rectangles.
- [Grouped mismatch inventory](visual-parity-mismatches.md): all requested areas for every implemented page and brand.

Production sign-off requires matching screenshots or accessible pages for the same product/content, variant, viewport, scroll position and state. The local viewer is a regression aid, not a substitute for that comparison. No “close enough” acceptance is asserted.

## Local visual regression result

The structural refactor's complete 63-page/viewport capture comparison recorded no missing captures, no horizontal overflow, no broken images, and no changes greater than 1px in the 11 measured element rectangles. This is a limited geometry check, not a full pixel comparison and not production parity. The before/after viewer preserves screenshots for manual review.

One concrete visual defect found during review is the named-color fallback: a catalog label such as “Brown” became the browser's reddish CSS `brown`, even though the actual product was wood. Purchase swatches now use an explicit catalog color code or swatch image; when neither is available, they use the selected variant's real product photograph. Color names remain labels. This avoids inventing a texture or material color and applies consistently to GR, FG and GH purchase variants.
