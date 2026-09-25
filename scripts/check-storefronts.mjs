// Read-only smoke check against the running local application. No cart writes.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const [brand, storeKey] of [['fg', 'frontgate'], ['gr', 'grandin-road'], ['gh', 'garnethill']]) {
    if (process.argv[2] && process.argv[2] !== brand) continue;
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    const demoRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      assert.equal(request.method(), 'GET', 'Smoke checks must not mutate data');
      if (new URL(request.url()).pathname.startsWith('/demo/')) demoRequests.push(request.url());
    });
    await page.goto(`http://localhost:5173/${brand}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.shop-product-card').first().waitFor({ timeout: 60000 });
    await page.locator('img').evaluateAll((images) => images.forEach((image) => image.setAttribute('loading', 'eager')));
    await page.evaluate(() => Promise.race([Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => {}))), new Promise((resolve) => setTimeout(resolve, 12000))]));
    await page.screenshot({ path: `test-results/live-${brand}-home.png`, fullPage: true });
    if (brand === 'gh') {
      for (const width of [820, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const hero = await page.locator('.home-hero').boundingBox();
        const cta = await page.locator('.hero-copy .button').boundingBox();
        assert(cta.y >= hero.y && cta.y + cta.height <= hero.y + hero.height, 'Hero CTA must not be clipped');
        await page.screenshot({ path: `test-results/live-gh-home-${width}.png`, fullPage: true });
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.locator('.hero-copy .button').click();
    await page.locator('.shop-product-card').first().waitFor();
    const displayed = await page.locator('.shop-product-card').count();
    const response = await page.request.get(`http://localhost:5173/api/products?store=${storeKey}`);
    assert.equal(response.status(), 200);
    const data = await response.json();
    assert.equal(displayed, Math.min(data.total, 24));
    await page.locator('.shop-product-card h3').first().click();
    await page.locator('.product-info-panel h1').waitFor();
    assert.equal(await page.locator('.product-info-panel h1').innerText(), data.products[0].name);
    await page.evaluate(() => Promise.race([Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => {}))), new Promise((resolve) => setTimeout(resolve, 10000))]));
    await page.screenshot({ path: `test-results/live-${brand}-pdp-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: `test-results/live-${brand}-pdp-mobile.png`, fullPage: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(demoRequests, []);
    console.log(JSON.stringify({ route: `/${brand}`, storeKey, total: data.total, displayed, categories: data.products[0].categories?.length, staticImageRequests: demoRequests.length }));
    await page.close();
  }
} finally {
  await browser.close();
}
