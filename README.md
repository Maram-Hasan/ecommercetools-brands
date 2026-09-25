# Commerce storefronts

React + TypeScript, Node/Express and commercetools in one repository. Open **http://localhost:5173/fg**, **/gr** or **/gh** after starting the development server. The root URL opens Frontgate.

## Run and validate

Use Node.js 20.19+ or 22.12+ and npm. Keep the existing private `.env`; for a fresh setup copy `.env.example` and fill in server credentials.

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run test:browser
npm run build
npm start
```

Express hosts Vite in development and serves `dist` with `npm start`. Run the build first. Both modes bind to loopback. Playwright uses installed Microsoft Edge and starts its isolated server on port 5188. Browser tests intercept commerce responses; API/domain tests use fake credentials and transport. Tests do not create live carts or orders.

## Structure

```text
shared/brands/            authoritative FG / GR / GH configuration
shared/domain/            normalized API DTOs: products, cart, categories, money
src/App.tsx               provider/layout composition
src/app/                  internal router, page outlet, layout, app entry
src/brands/               active-brand provider and intentional brand overrides
src/features/             catalog, product, cart, minicart, checkout, home
src/components/           shared UI and shell
src/services/             HTTP transport and catalog/cart operations
src/mappers/              frontend model adaptation
src/domain/               frontend product/cart models and product helpers
src/styles/               shared/component/page styles and tokens
src/legacy/               isolated, lazy-loaded Everyday / Explore demo
shared/legacy/            demo settings; no storefront compatibility conversion
server/commercetools/     SDK access, Store selection, vendor mappers
server/stores.ts          API Store allowlist composed from both configurations
```

Read the [architecture decisions](docs/architecture.md), [initial audit and sequence](docs/refactor-audit.md), [style conventions](docs/styles.md) and [engineering report](docs/refactor-report.md).

| Brand        | Route | commercetools Store |
| ------------ | ----- | ------------------- |
| Frontgate    | /fg   | frontgate           |
| Grandin Road | /gr   | grandin-road        |
| Garnet Hill  | /gh   | garnethill          |

Each brand supports `/category/:slug`, `/product/:slug`, `/cart`, and `/checkout`. Search uses the category route's `q` parameter. Product links use localized slugs; existing UUID deep links remain supported. Product IDs, keys, slugs, product numbers, variant IDs and SKUs are separate fields.

## API and cart behavior

The browser calls only the local Express API with a validated Store key. Products use `GET /api/products`, `GET /api/products/by-slug/:slug`, or the retained UUID endpoint `GET /api/products/:id`. Cart reads use `GET /api/cart`; additions use `POST /api/cart/items`; quantity/removal uses `PATCH /api/cart/items/:id` (quantity zero removes). React receives normalized DTOs, never SDK responses or credentials.

One CartProvider supplies all storefront purchase flows. HTTP-only Store cookies isolate bags. Server mutations use the current commercetools version; conflicts refresh state and require user retry, without replaying additions. Expired or incompatible market carts are cleared. Quantity is limited to 99 per item. Tax and inventory tracking remain disabled for demo carts, and checkout never places an order or takes payment.

Stores with Inclusion Product Selections use Store-scoped assignments and projections. Unpublished/unavailable projections are omitted; other errors are surfaced. Stores without Inclusion selections expose the project catalog with Store projection. Exclusion selections and ambiguous multiple-channel policies are explicitly unsupported. No remote assortment settings are changed by this app. Slug lookup and in-browser category/search currently read the Store catalog and need a scalable listing/index strategy for larger assortments.

## Visual review

[Production parity remains blocked](docs/visual-parity-assessment.md): current production browser requests returned Access Denied and no matching archived screenshots are present in this checkout. Local comparisons cover home, category, search, PDP, minicart, cart and checkout at desktop/tablet/mobile. [The mismatch inventory](docs/visual-parity-mismatches.md) records every requested area separately for each brand/page.

With `npm run dev` running:

```sh
node scripts/capture-production-reference.mjs
node scripts/capture-parity.mjs before
node scripts/capture-parity.mjs after
node scripts/build-parity-report.mjs
```

Open `test-results/visual-parity/index.html`. Captures read the live Store catalog into a browser snapshot and use a browser-only cart; API writes are blocked. Generated screenshots stay under ignored `test-results`. For an incremental capture, append brand and optionally page, e.g. `after gr pdp`. The reference project supplied existing brand assets and structural conventions; it is not evidence of current pixel parity. See [asset provenance](public/ASSETS.md).

## Retained demo

The documented original demo is isolated at `/?store=b2c-retail-store` and `/?store=second_store_explore`. Its selector contains only these demo Stores. Storefront brands use their dedicated routes. The legacy UI and stylesheet are loaded only for that entry; storefront configuration never depends on legacy types.

## Environment variables

Store switching requires `view_stores:YOUR_PROJECT_KEY`, and Product Selection catalogs require `view_product_selections:YOUR_PROJECT_KEY`, in `CTP_SCOPES` and on the API client. Existing broader project permissions work too. The existing local credentials already support both Stores and their assignments; no additional credentials are needed per Store.

All these variables belong in the root `.env`. Do not add a `VITE_` prefix to credentials or import server files into `src/`.

| Variable            | Required | Value                                                                                                                                                                    |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CTP_PROJECT_KEY`   | Yes      | Your commercetools project key.                                                                                                                                          |
| `CTP_CLIENT_ID`     | Yes      | API client ID from Merchant Center.                                                                                                                                      |
| `CTP_CLIENT_SECRET` | Yes      | API client secret from Merchant Center.                                                                                                                                  |
| `CTP_AUTH_URL`      | Yes      | Your regional HTTPS auth URL, e.g. `https://auth.europe-west1.gcp.commercetools.com`.                                                                                    |
| `CTP_API_URL`       | Yes      | Your regional HTTPS API URL, e.g. `https://api.europe-west1.gcp.commercetools.com`.                                                                                      |
| `CTP_SCOPES`        | Yes      | Space-separated scopes: `view_published_products:YOUR_PROJECT_KEY manage_orders:YOUR_PROJECT_KEY view_stores:YOUR_PROJECT_KEY view_product_selections:YOUR_PROJECT_KEY`. |
| `CTP_CURRENCY`      | No       | ISO currency code, default `USD`. Must match available product prices.                                                                                                   |
| `CTP_COUNTRY`       | No       | Two-letter country code, e.g. `US` or `DE`. Defaults to unset for country-independent prices.                                                                            |
| `CTP_LOCALE`        | No       | Preferred product translation, default `en-US`; falls back to another available translation.                                                                             |
| `PORT`              | No       | Local port, default `5173`. Changing it also changes the browser URL.                                                                                                    |

Use the region URLs shown with your API client in Merchant Center. The API client must actually be granted the requested scopes; changing `.env` alone does not grant permissions. Existing broader project scopes can also work.

## Operational notes

- Catalog diagnostics are controlled by `CTP_DEBUG_PRODUCTS`; logs contain public IDs/keys/SKUs, not credentials. Disable them for quiet local captures.
- Access denied or missing prices should be corrected in server credentials/market configuration, never by adding frontend secrets or fallback merchandise.
- No Bazaarvoice, CMS migration, promotions provider, payment gateway, analytics, personalization, search provider, Java backend, or separate repository was introduced.
