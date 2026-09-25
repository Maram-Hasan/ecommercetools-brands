# Frontgate / Grandin Road / Garnet Hill — commercetools storefront preview

The current visual demo is available at **http://localhost:5173/fg**,
**http://localhost:5173/gr** and **http://localhost:5173/gh** after `npm run dev`. One shared React application
provides all three brand shells, product lists, product details, minicart, bag and
five-step demo checkout. Catalogs and carts use the new commercetools Stores
`frontgate`, `grandin-road` and `garnethill`, configured in **shared/storefronts.ts**.
Product images, prices, variants and category navigation come from commercetools;
there is no static product fallback or sample shopping bag. The existing
Node/Express architecture is retained.

Run `npm run test:browser` for desktop, tablet and mobile coverage.

The [visual parity audit](docs/visual-parity-assessment.md) and
[page-by-page mismatch inventory](docs/visual-parity-mismatches.md) track all three
brands across home, category, search, PDP, minicart, cart and checkout. **No page is
signed off against current production.** Live production access is denied; available
archived screenshots and Spark source are explicitly distinguished as evidence.
Open `test-results/visual-parity/index.html` for the comparison viewer. To repeat a
local capture with the preview running, use `node scripts/capture-parity.mjs before`
or `after`, then `node scripts/build-parity-report.mjs`. Captures block API writes
and use a browser-only cart fixture built from live product data.

Garnet Hill uses `/gh`, `/gh/category/:slug`, `/gh/product/:id`, `/gh/cart`, and
`/gh/checkout`. Its verified Store key is `garnethill`. All brand settings are in
`shared/storefronts.ts`; `src/brands/gh.css` supplies GH's typography, header,
editorial homepage, catalog, product and footer styling. Purchase controls reuse
the FG variant panel and common `fg-pdp.css` layout with GH overrides. GH's hero,
category images, editorial product links, prices and options use the Store catalog.

The GH Store currently has no Product Selections and therefore exposes the project's
published catalog through the existing Store projection. Assign a GH Inclusion
Product Selection in Merchant Center to limit its assortment. This implementation
does not modify remote Store settings or merchandise.

Visual references: [Garnet Hill](https://www.garnethill.com/) and its
[public homepage screenshot](https://cdn.trustedsite.com/static/img/dyn/?do=site-og&host=garnethill.com).
Live browser access returned Access Denied on September 25, 2026. The screenshot
guided the desktop header and editorial design; mobile and tablet layouts are
responsive adaptations, not verified pixel matches. The announcement uses descriptive
copy rather than advertising unconfigured production discounts or free shipping.

The original Everyday POC remains available through the `?store=` URLs below.
The following sections describe its shared backend and original presentation.

A small React + Vite + TypeScript storefront with an Express API. One process serves both the UI and API. The commercetools SDK and credentials run only on the server.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm. From this directory:

```sh
npm install
```

Keep your existing `.env`. For a fresh setup, copy `.env.example` to `.env`, then replace the placeholder credentials. In PowerShell: `Copy-Item .env.example .env` (only if you do not already have `.env`).

```sh
npm run dev
```

Open **http://localhost:5173**. Express hosts Vite in middleware mode, so no second terminal or separate API URL is needed. React updates through Vite HMR; `tsx watch` restarts the server when server code changes. Restart the command after editing `.env`.

## Environment variables

Store switching requires `view_stores:YOUR_PROJECT_KEY`, and Product Selection catalogs require `view_product_selections:YOUR_PROJECT_KEY`, in `CTP_SCOPES` and on the API client. Existing broader project permissions work too. The existing local credentials already support both Stores and their assignments; no additional credentials are needed per Store.

All these variables belong in the root `.env`. Do not add a `VITE_` prefix to credentials or import server files into `src/`.

| Variable            | Required | Value                                                                                              |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `CTP_PROJECT_KEY`   | Yes      | Your commercetools project key.                                                                    |
| `CTP_CLIENT_ID`     | Yes      | API client ID from Merchant Center.                                                                |
| `CTP_CLIENT_SECRET` | Yes      | API client secret from Merchant Center.                                                            |
| `CTP_AUTH_URL`      | Yes      | Your regional HTTPS auth URL, e.g. `https://auth.europe-west1.gcp.commercetools.com`.              |
| `CTP_API_URL`       | Yes      | Your regional HTTPS API URL, e.g. `https://api.europe-west1.gcp.commercetools.com`.                |
| `CTP_SCOPES`        | Yes      | Space-separated scopes: `view_published_products:YOUR_PROJECT_KEY manage_orders:YOUR_PROJECT_KEY view_stores:YOUR_PROJECT_KEY view_product_selections:YOUR_PROJECT_KEY`. |
| `CTP_CURRENCY`      | No       | ISO currency code, default `USD`. Must match available product prices.                             |
| `CTP_COUNTRY`       | No       | Two-letter country code, e.g. `US` or `DE`. Defaults to unset for country-independent prices.      |
| `CTP_LOCALE`        | No       | Preferred product translation, default `en-US`; falls back to another available translation.       |
| `PORT`              | No       | Local port, default `5173`. Changing it also changes the browser URL.                              |

Use the region URLs shown with your API client in Merchant Center. The API client must actually be granted the requested scopes; changing `.env` alone does not grant permissions. Existing broader project scopes can also work.

## Features and behavior

- Published products in a responsive grid, with pagination (24 per page), name, image, selected market price, and SKU/key.
- Product details, image thumbnails, variant selection, and add-to-bag quantity.
- Real commercetools carts, quantity updates, removal, and server-calculated line totals and cart total.
- The cart ID stays in an HTTP-only, SameSite cookie. Refreshing the page or restarting the server preserves the cart. Empty browsing does not create a cart.
- Loading, empty, missing-image, missing-price, and API error states, with retries.
- Hash routes (`#/products/ID` and `#/cart`) keep navigation simple without a router dependency.

Only published products appear. A product needs a price matching `CTP_CURRENCY`, optional `CTP_COUNTRY`, and the selected Store's distribution channel to be purchasable. Product projections and carts use the same price context, including commercetools' fallback to channel-independent prices. Store settings are read server-side from Merchant Center. The current Stores each have zero or one distribution/supply channel; multiple channels need an explicit selection policy in `server/commercetools/stores.ts`.

Stores with Inclusion Product Selections use the Store-scoped `product-selection-assignments` endpoint to discover products assigned to active selections. The backend reads all assignment pages, deduplicates product IDs, and retrieves each product with `inStoreKeyWithStoreKeyValue({ storeKey }).productProjections().withId(...)`. Commercetools applies publication, Store availability, and allowed variants. Unavailable/unpublished projections return 404 and are omitted; other API failures are surfaced. Pagination and totals are based on the available unique products. React renders the mapped response without filtering products.

`second_store_explore` currently uses the active Inclusion selection `Explore 2 Selection List`. Its catalog is driven by those assignments, with no IDs or SKUs hardcoded in the app. Stores without Inclusion selections retain the complete-catalog query with `storeProjection`. Active Exclusion selections remain unsupported and return an explicit error rather than an incorrect catalog. Customer groups are not configured.

For this small POC, selected products are resolved on each request (eight concurrent projection reads at a time), so Merchant Center changes are not hidden by a local cache. Large assortments would need a different listing strategy; the assignment API offset limit is enforced instead of silently truncating results.

### Temporary catalog diagnostics

In `npm run dev`, the server prints `[catalog]` entries for the requested Store key, assignment count reported by commercetools, unique assigned product count, returned count, and each returned product's ID/key/SKUs. These logs contain no credentials, tokens, or raw SDK errors. Set `CTP_DEBUG_PRODUCTS=false` in `.env` and restart to silence them. Logging is off by default in `npm start`; set `CTP_DEBUG_PRODUCTS=true` to enable it there.

Carts expire after seven days without modification. Changing the currency or country starts a new cart on the next add. Tax calculation and inventory tracking are disabled for these demo carts; totals are merchandise totals and no checkout or orders are created. No authentication, checkout, CMS, search, or additional commerce integrations are included.

## Preview and customize each Store

Use the **Store** selector in the header, or open these URLs directly:

- http://localhost:5173/?store=b2c-retail-store — green theme, four-column desktop grid.
- http://localhost:5173/?store=second_store_explore — purple theme, product rows with descriptions.

Both use the same `npm run dev` process. The default URL opens `b2c-retail-store`. Switching Stores returns to the collection and reloads the app so pending requests, pagination, and selected variants cannot carry over. Details/cart links retain the Store query parameter. Unknown Store keys are rejected in both the UI and API.

Edit **`shared/storefronts.ts`** to customize each Store:

| Setting                                                           | Controls                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| `name`, `brand`, `announcement`                                   | Store selector, wordmark, and announcement bar                        |
| `headline`, `description`                                         | Homepage heading and introduction                                     |
| `theme.primary`, `theme.primaryHover`                             | Buttons, active navigation, and accents                               |
| `theme.background`, `theme.surface`, `theme.accent`, `theme.text` | Page, product-image, panel, and text colors                           |
| `productLayout`                                                   | `grid` or `list`                                                      |
| `productsPerRow`                                                  | Desktop grid columns: `2`, `3`, or `4`; small screens use two columns |
| `showProductDescription`                                          | Product-card descriptions                                             |

Styles use CSS variables in `src/styles.css`; shared React pages read the active settings through `src/storefront.tsx`. This file contains public settings only. Keep secrets in `.env` and integration calls on the server.

Each Store has its own HTTP-only cart cookie. Carts are created, read, and updated through commercetools' Store-scoped endpoints. Adding an item applies that Store's distribution/supply channels. A cart from one Store cannot be reused in the other, even if its ID is copied. Existing project-level carts are not migrated; a new Store cart is created on the first add.

The requested future integration is intended for `second_store_explore`, but its feature/service has not yet been specified. Both `features` maps are currently empty: no placeholder integration is enabled. Once a real integration is chosen, add a named flag only to that Store and enforce it in both the UI and its backend route. A UI flag alone is not backend authorization.

## Commands

```sh
npm run dev        # Local Express + Vite server
npm run typecheck  # Check browser and server TypeScript
npm test           # Mapping and API tests; no live project writes
npm run build      # Type-check and build the React app into dist/
npm start          # Serve dist/ plus the Express API at the same local URL
```

Run `npm run build` before `npm start`. Start uses `tsx` to execute server TypeScript; keep development dependencies installed for this local POC. Both modes bind to the loopback interface and are intended for local use.

## Folder structure

```text
src/                     React UI, API fetch helper, and loading hook
  pages/                 Catalog, product details, and cart page
server/                  Express startup, local API, and environment validation
  commercetools/         SDK client, commerce operations, and response mapping
shared/types.ts          Small data types shared by the API and UI
shared/storefronts.ts    Store allowlist, themes, product layout, and feature settings
tests/                   Automated API and mapping tests
dist/                    Generated browser build (ignored by Git)
.env.example             Safe environment template; .env stays private
```

The browser calls only `/api/products`, `/api/products/:id`, `/api/cart`, and `/api/cart/items`, always with a validated `store` query parameter. Credentials and OAuth tokens never form part of these responses. The API returns explicit storefront data instead of entire SDK responses and does not serialize SDK errors.

## Troubleshooting

- **Access denied:** check the API client credentials, region, and granted scopes.
- **No products:** publish products in this project; staged products are intentionally excluded.
- **Price unavailable:** match the currency and country to your prices; select a priced variant on the detail page.
- **Cart changed in another tab:** the page refreshes its cart; retry the operation against the current version.
- **Port in use:** stop the other process or set another `PORT` and use that URL.

Implementation references: [Vite middleware mode](https://vite.dev/guide/ssr#setting-up-the-dev-server), [commercetools product projections and price selection](https://docs.commercetools.com/api/projects/productProjections), and [API scopes](https://docs.commercetools.com/api/scopes).
