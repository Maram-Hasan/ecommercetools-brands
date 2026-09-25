// Read-only verification using the actual Grandin Road Store. No cart writes.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const origin = 'http://localhost:5173';
const products = [];
for (let offset = 0; ; offset += 24) {
  const response = await fetch(`${origin}/api/products?store=grandin-road&offset=${offset}`);
  assert.equal(response.status, 200);
  const page = await response.json();
  products.push(...page.products);
  if (offset + page.limit >= page.total) break;
  assert(page.products.length && offset < 10000);
}
const product = products.find((item) => /wreath.*storage|storage.*bag/i.test(item.name)) ?? products[0];
assert(product, 'Grandin Road must have a published product to capture');
console.log(JSON.stringify({ product: product.name, id: product.id, wreathFound: /wreath.*storage|storage.*bag/i.test(product.name), variants: product.variants.map(({ id, sku, images, price, attributes, available }) => ({ id, sku, images: images.length, price, attributes, available })) }));
await mkdir('test-results/gr-pdp', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  page.on('request', (request) => assert.equal(request.method(), 'GET'));
  await page.goto(`${origin}/gr/product/${product.id}`);
  await page.locator('.product-info-panel h1').waitFor();
  await page.evaluate(() => Promise.race([Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => {}))), new Promise((resolve) => setTimeout(resolve, 10000))]));
  for (const width of [1440, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `test-results/gr-pdp/live-${width}.png`, fullPage: true });
  }
  assert.equal(await page.locator('.color-option').count(), product.variants.length);
  assert.equal(await page.locator('.gallery-thumbnails button').count(), new Set(product.variants.flatMap((variant) => variant.images)).size);
  for (const variant of product.variants) {
    await page.locator('.color-option').nth(product.variants.indexOf(variant)).click();
    if (variant.sku) assert((await page.locator('.product-heading-row .sku').innerText()).includes(variant.sku));
  }
  const priced = product.variants.find((variant) => variant.price);
  if (priced) {
    await page.locator('.color-option').nth(product.variants.indexOf(priced)).click();
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    const expected = await page.evaluate((price) => new Intl.NumberFormat(undefined, { style: 'currency', currency: price.currencyCode }).format(price.amount * 2 / 10 ** price.fractionDigits), priced.price);
    assert.equal(await page.locator('output[aria-label="Product total"]').innerText(), expected);
  }
  console.log('GR PDP live data, variants, gallery and responsive checks passed (read-only).');
} finally { await browser.close(); }
