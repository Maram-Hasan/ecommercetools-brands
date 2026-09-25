// Capture visible references only; never download production source or styles.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = 'test-results/production-reference';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
function target(url) {
  const parsed = new URL(url);
  const brand = {
    'www.frontgate.com': 'fg',
    'www.grandinroad.com': 'gr',
    'www.garnethill.com': 'gh',
  }[parsed.hostname];
  if (!brand)
    throw new Error(
      'Reference URL must be one of the three production storefronts.',
    );
  return [brand + (parsed.pathname === '/' ? '' : '-page'), parsed.href];
}
const targets = process.argv[2]
  ? [target(process.argv[2])]
  : [
      'https://www.frontgate.com/',
      'https://www.grandinroad.com/',
      'https://www.garnethill.com/',
    ].map(target);
try {
  for (const [brand, url] of targets) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    let error;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(8000);
    } catch (failure) {
      error = failure.message;
    }
    const visibleText = await page
      .locator('body')
      .innerText()
      .catch(() => '');
    const result = {
      brand,
      capturedAt: new Date().toISOString(),
      requestedUrl: url,
      url: page.url(),
      title: await page.title(),
      error,
      visibleText: visibleText.slice(0, 1800),
    };
    results.push(result);
    console.log(JSON.stringify(result));
    await page.screenshot({
      path: `${directory}/${brand}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `${directory}/${brand}-mobile.png`,
      fullPage: true,
    });
    await writeFile(
      `${directory}/${brand}-capture.json`,
      JSON.stringify(result, null, 2),
    );
    await page.close();
  }
  await writeFile(
    `${directory}/capture.json`,
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
