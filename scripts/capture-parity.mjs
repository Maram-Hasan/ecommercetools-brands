// Read-only visual audit. Cart responses are isolated browser fixtures, never remote writes.
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase))
  throw new Error('Usage: node scripts/capture-parity.mjs before|after');
const origin = process.env.PARITY_ORIGIN || 'http://localhost:5173';
const directory = `test-results/visual-parity/${phase}`;
const selectedBrand = process.argv[3];
const selectedPage = process.argv[4];
if (selectedBrand && !['fg', 'gr', 'gh'].includes(selectedBrand))
  throw new Error('Unknown brand');
if (
  selectedPage &&
  ![
    'home',
    'category',
    'search',
    'pdp',
    'minicart',
    'cart',
    'checkout',
  ].includes(selectedPage)
)
  throw new Error('Unknown page');
await mkdir(directory, { recursive: true });
const previous = selectedBrand
  ? JSON.parse(
      await readFile(`${directory}/manifest.json`, 'utf8').catch(
        () => '{"records":[]}',
      ),
    )
  : { records: [] };
const records = previous.records.filter(
  (record) =>
    record.brand !== selectedBrand ||
    (selectedPage && record.page !== selectedPage),
);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const [brand, store] of [
    ['fg', 'frontgate'],
    ['gr', 'grandin-road'],
    ['gh', 'garnethill'],
  ]) {
    if (selectedBrand && brand !== selectedBrand) continue;
    const response = await fetch(`${origin}/api/products?store=${store}`);
    if (!response.ok)
      throw new Error(`${store}: catalog HTTP ${response.status}`);
    const catalog = await response.json();
    const allProducts = [...catalog.products];
    for (
      let offset = catalog.limit;
      offset < catalog.total;
      offset += catalog.limit
    ) {
      const next = await fetch(
        `${origin}/api/products?store=${store}&offset=${offset}`,
      );
      if (!next.ok) throw new Error(`${store}: catalog HTTP ${next.status}`);
      allProducts.push(...(await next.json()).products);
    }
    const product = catalog.products.find((item) =>
      item.variants.some((variant) => variant.price),
    );
    if (!product) throw new Error(`${store}: no priced product to audit`);
    const variant = product.variants.find((item) => item.price);
    const cart = {
      quantity: 1,
      total: variant.price,
      items: [
        {
          id: 'audit-item',
          productId: product.id,
          name: product.name,
          sku: variant.sku,
          image: variant.images[0],
          price: variant.price,
          total: variant.price,
          quantity: 1,
        },
      ],
    };
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/api/**', (route) => {
      if (route.request().method() !== 'GET')
        return route.abort('blockedbyclient');
      if (new URL(route.request().url()).pathname === '/api/cart')
        return route.fulfill({ json: cart });
      const url = new URL(route.request().url());
      if (url.pathname === '/api/products') {
        const offset = Number(url.searchParams.get('offset') || 0);
        return route.fulfill({
          json: {
            products: allProducts.slice(offset, offset + catalog.limit),
            total: allProducts.length,
            limit: catalog.limit,
            offset,
          },
        });
      }
      if (url.pathname.startsWith('/api/products/')) {
        const identifier = decodeURIComponent(url.pathname.split('/').pop());
        const item = allProducts.find(
          (item) => item.id === identifier || item.slug === identifier,
        );
        return route.fulfill(
          item
            ? { json: item }
            : {
                status: 404,
                json: { message: 'Product not in captured Store catalog.' },
              },
        );
      }
      return route.continue();
    });
    const routes = [
      ['home', `/${brand}`, '.shop-product-card'],
      ['category', `/${brand}/category/all-products`, '.shop-product-card'],
      [
        'search',
        `/${brand}/category/all-products?q=${encodeURIComponent(product.name)}`,
        '.shop-product-card',
      ],
      ['pdp', `/${brand}/product/${product.id}`, '.product-info-panel h1'],
      ['minicart', `/${brand}/product/${product.id}`, '.product-info-panel h1'],
      ['cart', `/${brand}/cart`, '.bag-item'],
      ['checkout', `/${brand}/checkout`, '.checkout-step'],
    ];
    for (const [viewport, width, height] of [
      ['desktop', 1440, 1000],
      ['tablet', 820, 1180],
      ['mobile', 390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      for (const [name, route, ready] of routes) {
        if (selectedPage && name !== selectedPage) continue;
        await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
        await page.locator(ready).first().waitFor({ timeout: 60000 });
        await page.locator('img').evaluateAll((images) =>
          images.forEach((img) => {
            img.loading = 'eager';
          }),
        );
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.race([
            Promise.all(
              [...document.images].map((img) => img.decode().catch(() => {})),
            ),
            new Promise((resolve) => setTimeout(resolve, 15000)),
          ]);
        });
        if (name === 'minicart')
          await page.getByRole('button', { name: /Open shopping bag/ }).click();
        const file = `${brand}-${name}-${viewport}.png`;
        await page.screenshot({ path: `${directory}/${file}`, fullPage: true });
        const metrics = await page.evaluate(() => {
          const selectors = [
            '.site-header',
            '.brand-header',
            '.brand-wordmark',
            '.site-search',
            '.production-navigation',
            '.page-width',
            '.gallery-image',
            '.product-info-panel',
            '.product-heading-row h1',
            '.add-to-cart',
            '.site-footer',
          ];
          const elements = {};
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (!element) continue;
            const { x, y, width, height } = element.getBoundingClientRect();
            const css = getComputedStyle(element);
            elements[selector] = {
              x,
              y,
              width,
              height,
              font: css.font,
              color: css.color,
            };
          }
          return {
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            elements,
            brokenImages: [...document.images]
              .filter((img) => !img.complete || !img.naturalWidth)
              .map((img) => img.src),
          };
        });
        records.push({
          capturedAt: new Date().toISOString(),
          brand,
          page: name,
          viewport,
          width,
          height,
          route,
          file,
          product: product.name,
          data: 'Live Store catalog snapshot captured once per brand; browser-only cart fixture; no remote writes',
          ...metrics,
        });
      }
    }
    if (errors.length) throw new Error(`${brand}: ${errors.join('; ')}`);
    await page.close();
    console.log(
      `${phase}: ${brand}, ${selectedPage ? 3 : 21} screenshots captured`,
    );
  }
} finally {
  await writeFile(
    `${directory}/manifest.json`,
    JSON.stringify(
      { capturedAt: new Date().toISOString(), origin, records },
      null,
      2,
    ),
  );
  await browser.close();
}
