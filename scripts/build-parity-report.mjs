import { mkdir, readFile, writeFile } from 'node:fs/promises';

const directory = 'test-results/visual-parity';
const brands = ['fg', 'gr', 'gh'];
const pages = [
  'home',
  'category',
  'search',
  'pdp',
  'minicart',
  'cart',
  'checkout',
];
const viewports = ['desktop', 'tablet', 'mobile'];
const groups = [
  'header',
  'utility links',
  'navigation',
  'secondary navigation',
  'container width',
  'typography',
  'font size',
  'font weight',
  'line height',
  'spacing',
  'borders',
  'colors',
  'image sizes',
  'product gallery proportions',
  'PDP content alignment',
  'breadcrumbs',
  'swatches/options',
  'quantity',
  'total',
  'CTA',
  'minicart',
  'cart',
  'checkout',
  'footer',
  'tablet',
  'mobile',
];
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const before = await readJson(`${directory}/before/manifest.json`);
const after = await readJson(`${directory}/after/manifest.json`);
const key = (record) => `${record.brand}-${record.page}-${record.viewport}`;
const baseline = new Map(before.records.map((record) => [key(record), record]));
const current = new Map(after.records.map((record) => [key(record), record]));
const measurements = {
  header: '.site-header',
  'container width': '.page-width',
  'image sizes': '.gallery-image',
  'product gallery proportions': '.gallery-image',
  'PDP content alignment': '.product-info-panel',
  CTA: '.add-to-cart',
  footer: '.site-footer',
  navigation: '.production-navigation',
};
const notes = {
  fg: 'FG uses its own header and black CTA. Production fonts, editorial imagery, spacing, and PDP proportions remain unverified.',
  gr: 'GR retains compact utility/header/navigation rows, secondary navigation, vertical thumbnails, swatches, quantity/total, and full-width navy CTA. Exact production geometry remains unverified.',
  gh: 'GH uses editorial navigation, Kepler headings, taupe CTA, its own homepage and footer. Body font, editorial assets, and GH-specific PDP composition remain unverified.',
};
const areas = {
  header: 'src/components/layout/SiteHeader.tsx',
  footer: 'src/components/layout/SiteFooter.tsx',
  minicart: 'src/features/minicart',
  cart: 'src/features/cart',
  checkout: 'src/features/checkout',
};
const delta = [];
for (const record of after.records) {
  const prior = baseline.get(key(record));
  if (!prior) continue;
  for (const [selector, element] of Object.entries(record.elements)) {
    const old = prior.elements[selector];
    if (!old) continue;
    const changed = Object.fromEntries(
      ['x', 'y', 'width', 'height']
        .filter((field) => Math.abs(element[field] - old[field]) > 1)
        .map((field) => [field, { before: old[field], after: element[field] }]),
    );
    if (Object.keys(changed).length)
      delta.push({ page: key(record), selector, changed });
  }
}
await mkdir('docs', { recursive: true });
let markdown =
  '# Visual mismatch inventory\n\nProduction sign-off is **BLOCKED** for all pages. The live production captures on 2026-09-25 returned Access Denied for all three brands. No archived reference files were supplied in this checkout. Reference source is implementation evidence, not a current production screenshot. Each table applies to desktop, tablet and mobile; the viewer contains every local capture. Numeric measurements describe the POC only.\n\n';
for (const brand of brands)
  for (const page of pages) {
    markdown += `## ${brand.toUpperCase()} / ${page}\n\n${notes[brand]}\n\n| Area | Local evidence / owner | Production comparison |\n|---|---|---|\n`;
    for (const group of groups) {
      const selector = measurements[group];
      const values = viewports
        .map((viewport) => {
          const record = current.get(`${brand}-${page}-${viewport}`);
          const m = record?.elements?.[selector];
          return m
            ? `${viewport}: ${Math.round(m.width)}×${Math.round(m.height)}px`
            : null;
        })
        .filter(Boolean);
      const evidence = values.length
        ? values.join('; ')
        : areas[group] ||
          (/PDP|gallery|swatches|quantity|total|CTA|breadcrumbs/.test(group)
            ? 'src/features/product; src/styles/pages/product*; brand overrides'
            : 'src/styles; shared/brands; viewport captures');
      markdown += `| ${group} | ${evidence} | BLOCKED: matching production page/viewport reference missing. |\n`;
    }
    markdown += '\n';
  }
await writeFile('docs/visual-parity-mismatches.md', markdown);
await writeFile(
  `${directory}/geometry-diff.json`,
  JSON.stringify(delta, null, 2),
);
const summary = {
  before: before.records.length,
  after: after.records.length,
  missing: brands
    .flatMap((b) =>
      pages.flatMap((p) => viewports.map((v) => `${b}-${p}-${v}`)),
    )
    .filter((k) => !current.has(k)),
  overflow: after.records.filter((r) => r.overflow).map(key),
  brokenImages: after.records
    .filter((r) => r.brokenImages.length)
    .map((r) => ({ page: key(r), count: r.brokenImages.length })),
  changedGeometry: delta.length,
};
await writeFile(`${directory}/summary.json`, JSON.stringify(summary, null, 2));
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Storefront visual review</title>
<style>body{font:16px/1.5 system-ui;margin:24px;background:#f5f5f5;color:#222}h1{font-size:24px}label{margin-right:20px}select{font:inherit;padding:6px}.panels{display:grid;grid-template-columns:1fr 1fr;gap:16px}section{min-width:0;background:white;padding:12px}.frame{overflow:auto;height:75vh}img{width:100%;display:block}.actual img{width:auto;max-width:none}aside{padding:16px;background:#fff1cf;margin-block:16px}@media(max-width:800px){.panels{grid-template-columns:1fr}}</style>
<h1>Storefront before / after visual review</h1><aside>Production comparison blocked: all three production sites returned Access Denied. No matching archived screenshots are present. These panels compare local builds; they do not establish production parity.</aside>
<label>Brand <select id="brand">${brands.map((b) => `<option>${b}</option>`).join('')}</select></label><label>Page <select id="page">${pages.map((p) => `<option>${p}</option>`).join('')}</select></label><label>Viewport <select id="viewport">${viewports.map((v) => `<option>${v}</option>`).join('')}</select></label><label><input id="actual" type="checkbox">Actual pixels</label>
<p><a href="../../docs/visual-parity-mismatches.md">Grouped mismatch inventory</a> · <a href="geometry-diff.json">Geometry changes</a> · <a href="summary.json">Capture health</a></p><div class="panels"><section><h2>Before</h2><div class="frame"><img id="before" alt="Local baseline"></div></section><section><h2>After</h2><div class="frame"><img id="after" alt="Local refactor"></div></section></div>
<script>const get=id=>document.getElementById(id);function render(){const file=[get('brand').value,get('page').value,get('viewport').value].join('-')+'.png';for(const phase of ['before','after'])get(phase).src=phase+'/'+file;document.querySelector('.panels').classList.toggle('actual',get('actual').checked)}for(const id of ['brand','page','viewport','actual'])get(id).addEventListener('change',render);render();</script></html>`;
await writeFile(`${directory}/index.html`, html);
console.log(JSON.stringify(summary));
