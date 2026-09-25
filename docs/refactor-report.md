# Refactor engineering report

## Status

Architecture stages 1–6 are implemented. GR/FG/GH local visual regression review is implemented; production visual sign-off (stages 7–9) remains blocked by inaccessible production pages and missing matching screenshots. This report does not claim the full production-parity requirement is complete.

## Files changed, created and removed

See the complete [file inventory](refactor-files.md). Most deletions are moves/splits, not removed functionality.

| Change                           | Files / ownership                                                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replace dual brand configuration | `shared/storefronts.ts` → `shared/brands/{types,frontgate,grandin-road,garnet-hill,footer,index}.ts`, `shared/legacy/storefronts.ts`, `server/stores.ts`   |
| Composition and routing          | `src/App.tsx`, `src/app/{ApplicationEntry,PageOutlet,StorefrontLayout,router,routes}`, `src/brands/{BrandProvider,context}`                                |
| Isolate documented legacy demo   | old App/pages/styles moved into `src/legacy`; lazy entry; two demo Store settings only                                                                     |
| Split commerce                   | removed `src/services/commerce.ts` and `models.ts`; added HTTP/catalog/cart services, `src/domain`, `src/mappers`, `shared/domain`                         |
| Vendor mapping                   | `server/commercetools/mappers.ts` → `mappers/{product.mapper,cart.mapper,category.mapper,values}.ts`                                                       |
| Feature ownership                | `src/shop` → catalog/product/cart/minicart/checkout/home features; shell moved to `components/layout`; GH editorial home moved to brand ownership          |
| Split styling                    | removed `brands/brand.css`; added `styles/{shared,components,pages}`, tokens and single style entry; moved GR/GH overrides to brand folders                |
| Validation and tooling           | updated API/mapper/catalog/browser tests, added domain tests, enabled unused-local checking, corrected formatter targets and parity capture/report scripts |
| Documentation                    | audit, architecture, styling, production-parity assessment/inventory, this report and rewritten README                                                     |

## Architecture decisions

- Preserve React + TypeScript → Node/Express → commercetools in this repository. No backend migration, frontend secrets or direct SDK access from presentation.
- One authoritative storefront model. Keep the still-documented Everyday/Explore demo isolated; remove storefront-to-demo conversion and shared mutable Store configuration.
- Keep a small typed history router. It handles five route shapes, query search, malformed routes, browser history and native anchor behavior without adding a dependency.
- App is provider/layout composition. Brand resolution, theme, page routing, cart state and shell have explicit owners.
- Reuse the existing cart provider rather than adding another source of truth. Add explicit removal and stable refresh; protect successful writes from stale reads. Preserve server version handling and refresh-on-conflict without automatic add replay.
- Separate SDK mappers, API DTOs, frontend models, HTTP, catalog orchestration, cart operations and UI copy.
- Preserve product UUID/key/slug/product number/variant ID/SKU separately. Use localized slugs for new links; retain existing UUID reads intentionally for old links and legacy UI.
- Share actual component structure through header/home/purchase variants. Remove hard-coded GH checks in presentation; share tile purchase styles without FG-specific class names.
- Keep feature-owned form/gallery/cart components focused. Do not create placeholder integrations or providers for future work.

## Debt removed

Dual storefront/demo configuration, mutating compatibility conversion, misleading App entry, mixed route/theme/layout responsibilities, combined transport/mapping/copy, ID-as-slug mapping, SKU-as-product-number labeling, scattered GH checks, unreachable classic PDP rendering, dead navigation/PDP CSS, duplicated purchase declarations, duplicated legacy transport, and stale report claims about missing archived screenshots.

The style audit removed **77 unreachable rules** and extracted **46 shared purchase declarations**. TypeScript now rejects unused locals in browser and server projects.

## Debt intentionally retained

- The legacy demo remains separately available because it is documented existing behavior. Its old hash router and presentation are isolated, not refactored into the storefront architecture.
- Catalog search/filtering and slug lookup scan the Store catalog. Inclusion selections already require per-product projection reads. Large assortments need an indexed/paged design; the POC retains explicit limits and failure handling.
- Existing UUID deep links remain supported. Product numbers depend on the explicit catalog `product-number` attribute; SKU parsing is deliberately avoided.
- Existing responsive thresholds (700/800/1023/1100/1199px) are documented. Full unification is deferred until matching intermediate-width references establish the correct production transitions.
- Real FG/GH typography assets and production editorial content are incomplete. GH's tile purchase layout still needs a GH PDP reference to validate composition.
- Existing checkout is a local demo; tax/shipping/payment/order integrations remain out of scope. Reviews, ratings, promotion messaging and Going Fast remain deferred.
- API operations still live in a compact Express router; Store assignment scalability and multi-channel selection policy remain existing backend limitations.

## Visual fixes and remaining mismatches

The structural capture comparison covered **63 before + 63 after** page/viewport states, with no missing captures, overflow, broken images or rectangle changes over 1px across the measured elements. This is regression evidence, not a full pixel or production comparison.

A CSS extraction regression affecting narrow FG PDP widths was detected and corrected by retaining selector specificity and ordering shared responsive rules after desktop variants. Local swatch fidelity was improved: explicit catalog color/swatch data takes precedence; absent data uses the real variant photograph instead of guessing a material's color from a CSS name. Item numbers and SKUs are labeled distinctly.

| Brand | Remaining mismatch / evidence gap                                                                                                                                                                                                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FG    | Production font assets, homepage editorial images/content, header/navigation density, gallery/info proportions, option grouping/textures, footer and responsive spacing.                                                                                                                                        |
| GR    | Exact compact header dimensions/search/logo positions, navigation and breadcrumb rhythm, gallery scale, title/item/price alignment, swatch assets, product content/option completeness, footer and responsive composition. Local Wreath Storage Bag has fewer options/content than the indexed production page. |
| GH    | Body font, editorial assets/assortment, header/footer spacing, and verification that the shared tile PDP matches GH's actual structure at each viewport.                                                                                                                                                        |

See the [full per-page inventory](visual-parity-mismatches.md) and [evidence assessment](visual-parity-assessment.md). The generated local viewer is `test-results/visual-parity/index.html`. Live production homepages and the GR PDP returned Access Denied; no production page is signed off.

## Validation history

- Baseline: typecheck and 20 tests passed. Browser suite: 32/33 passed; tablet shell timed out waiting for products and passed on rerun.
- Brand group: typecheck, 20 tests, and browser coverage passed after that rerun.
- App/router group: typecheck, 20 tests, and three focused routing/layout smoke checks passed.
- Service/identity group: typecheck, 25 tests, all 11 desktop browser checks passed.
- Cart group: 25 tests and four focused concurrency/conflict/history/isolation checks passed.
- Feature group: typecheck and 25 tests passed; two browser assertions still expected SKU values to be labeled Item. Updated the assertions to the intended identity contract; focused PDP checks passed.
- CSS group: typecheck/tests passed; browser checks exposed an FG narrow-width overflow regression from rule extraction. Fixed specificity and source order; PDP checks passed.
- Final validation results are recorded below after the last visual correction.

## Warnings and failures

The browser runner reports `NO_COLOR` being ignored because `FORCE_COLOR` is set. API negative-path tests intentionally emit sanitized 400/403/404 messages. Git reports LF-to-CRLF normalization warnings. No warnings are hidden. Intermediate failures above were investigated and corrected or rerun with their outcome recorded.

Some local capture attempts failed during active development with connection-refused or timeout errors. The final complete captures replace those partial runs; capture tooling now snapshots the live catalog once per brand instead of repeatedly loading it for every page. Production access denial remains an external blocker, not a passing visual test.

## Recommended next step

Provide matching production screenshots or an accessible approved capture environment for FG/GR/GH, especially the GR Wreath Storage Bag PDP and GH PDP. Compare the same content/variant at the same viewport against the local viewer, then make measured brand-specific visual corrections. Keep stages 7–9 open until that evidence exists.

## Final validation

| Check                                                      | Result                                                                                                                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build` (includes browser/server typecheck)        | Passed after the final swatch correction; 96 modules built, legacy app emitted as a separate lazy chunk.                                                                                                                              |
| `npm test`                                                 | 27 API/catalog/mapper/domain tests passed after the final correction.                                                                                                                                                                 |
| `npm run test:browser`                                     | All 48 desktop/tablet/mobile checks passed before the final swatch correction.                                                                                                                                                        |
| Focused browser purchase/PDP suite after swatch correction | All 15 checks passed across the three viewports, covering each brand's purchase/cart/checkout flow plus GR and FG option-specific behavior.                                                                                           |
| `node scripts/check-gr-pdp.mjs`                            | Passed against live GR data through the slug route; read-only, no cart writes.                                                                                                                                                        |
| Final before/after capture report                          | 63 before + 63 after; no missing captures, no horizontal overflow, no broken images, no measured rectangle changes over 1px. Swatch content changes are visible in screenshots and are intentionally outside the geometry comparison. |
| `git diff --check`                                         | Passed; Git's LF/CRLF warnings are noted above.                                                                                                                                                                                       |

No final application tests are failing. Production parity remains blocked and is not included in the passing-test count. No remote writes, new dependencies, Java services, payment providers or future integration modules were introduced.
