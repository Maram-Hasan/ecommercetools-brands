import { mkdir, writeFile } from 'node:fs/promises';

const groups = [
  'header',
  'navigation',
  'typography',
  'spacing',
  'container width',
  'image sizing',
  'PDP layout',
  'product option styling',
  'CTA styling',
  'cart/minicart',
  'footer',
  'responsive behavior',
];
const pages = [
  'home',
  'category',
  'search',
  'pdp',
  'minicart',
  'cart',
  'checkout',
];
const brands = ['fg', 'gr', 'gh'];
const unknown =
  'UNVERIFIED — current production rendering unavailable; no numeric target asserted.';
const na = [
  'Not part of this page body.',
  'Not applicable; shared shell is audited separately in this table.',
  'No page-body change.',
  'N/A',
];
const row = (current, reference, area, status = 'OPEN') => [
  current,
  reference,
  area,
  status,
];

function observations(brand, page) {
  const isGH = brand === 'gh';
  const isFG = brand === 'fg';
  const product = ['pdp', 'minicart'].includes(page);
  const listing = ['category', 'search'].includes(page);
  const bodyFile =
    page === 'home'
      ? isGH
        ? 'GarnetHillHome.tsx'
        : 'Home.tsx: ClassicHome'
      : listing
        ? 'Category.tsx'
        : product
          ? 'ProductDetails.tsx'
          : page === 'cart'
            ? 'Cart.tsx'
            : 'Checkout.tsx';
  const pdpCss = brand === 'gr' ? 'gr-pdp.css' : 'fg-pdp.css';
  const result = {
    header: row(
      'Before: text wordmark with approximate font/spacing. Search, utilities and generic account/cart icons share one header on every route.',
      'Archived desktop reference shows distinctive logo shapes. Spark supplies exact SVG shapes and desktop logo dimensions. Current header height, sticky/collapse behavior and checkout shell are unverified.',
      'Shell.tsx: BrandWordmark/SiteHeader; shared/storefronts.ts: wordmark; brand-wordmark.css; site-header.css',
      'PARTIAL — vector logo corrected; remaining header geometry open',
    ),
    navigation: row(
      isFG
        ? 'Nine uppercase links; flat destinations; no production mega-menu.'
        : isGH
          ? 'Serif primary row plus uppercase featured row; flat destinations.'
          : 'Ten uppercase links plus seasonal secondary row; flat destinations.',
      isFG
        ? 'Saved FG reference has the same primary labels; dropdown layout and current navigation behavior are unverified.'
        : isGH
          ? 'GH composite shows primary + featured rows; full menu interactions cannot be assessed from the composite.'
          : 'Old GR snapshot has seven mixed-case categories. Spark has newer main/secondary navigation; do not revert to the archived menu.',
      'Shell.tsx: BrandNavigation; shared/storefronts.ts: header.navigation/secondaryNavigation; site-header.css; gh.css: .production-navigation/.production-subnavigation',
    ),
    typography: row(
      isFG
        ? 'Arial headings/body; text approximation of logo before change.'
        : isGH
          ? 'Before: Georgia headings and Arial body.'
          : 'Before: Georgia headings/PDP title and Arial body.',
      isFG
        ? 'FG snapshot uses sans-serif title; already same family category. Spark specifies Proxima Nova; exact font is not locally available.'
        : isGH
          ? 'Spark: Kepler light serif headings; Gibson body. Composite supports serif appearance, not exact measurements.'
          : 'Spark: Frank Ruhl Libre editorial headings, Open Sans body and PDP title. Old PDP snapshot predates this source design.',
      'shared/storefronts.ts: typography; fonts.css; ' +
        (isGH
          ? 'gh.css: heading/navigation/price selectors'
          : isFG
            ? 'fg-pdp.css: .product-heading-row h1'
            : 'gr-pdp.css: .product-heading-row h1'),
      isFG
        ? 'OPEN — exact Proxima Nova missing'
        : isGH
          ? 'PARTIAL — local Kepler applied; Gibson still missing'
          : 'SOURCE CORRECTED — current live comparison pending',
    ),
    spacing: row(
      'Shared section rhythm and page-specific margins. See before/after manifest for actual element coordinates at all three widths.',
      unknown,
      `src/shop/${bodyFile}; brand.css: page-specific margins/padding; ${isGH ? 'gh.css' : product ? pdpCss : 'site-header.css'}`,
    ),
    'container width': row(
      isGH
        ? 'Before: width min(1344px, 100%) defeats the 1440px max-width override.'
        : 'Shared page-width capped at 1344px; PDP max-width overrides cannot grow past the inherited width.',
      isGH
        ? 'Spark garnethill/styles/utils/_variables.scss specifies 1440px; no equal-viewport live production screenshot.'
        : 'Archived snapshots have different capture widths; Spark and archives are insufficient to establish each current page container. Do not stretch every page speculatively.',
      isGH
        ? 'gh.css: .page-width; brand.css: .page-width'
        : `brand.css: .page-width; ${pdpCss}: .pdp-page`,
      isGH
        ? 'SOURCE CORRECTED — 1440px cap now effective'
        : 'OPEN — needs measured reference',
    ),
    'image sizing': na,
    'PDP layout': na,
    'product option styling': na,
    'CTA styling': row(
      'Generic 48px shared buttons with brand primary color and uppercase labels.',
      unknown,
      `brand.css: .button; shared/storefronts.ts: buttons/colors; src/shop/${bodyFile}`,
    ),
    'cart/minicart': row(
      'Header opens a fixed side drawer (FG wide; GR/GH compact); current capture uses one browser-fixture item.',
      unknown + ' Production empty/populated/added-item states still required.',
      'Cart.tsx: MiniCart/CartItem/OrderSummary; brand.css: .drawer/.mini-cart-*; shared/storefronts.ts: minicart',
    ),
    footer: row(
      isGH
        ? 'Four service highlights, newsletter, three columns, footer logo and brand switcher.'
        : 'Generic three-message service ribbon, newsletter, three columns, footer logo and brand switcher.',
      'No supplied archive includes a full footer. Spark universal-footer separates pre-footer icons, signup, contacts and brand content; exact current content/height/spacing is unverified.',
      'Shell.tsx: SiteFooter; shared/storefronts.ts: footer; brand.css: .service-ribbon/.footer-main/.footer-bottom; gh.css: footer selectors',
    ),
    'responsive behavior': row(
      'POC captured at desktop 1440, tablet 820 and mobile 390. Header changes at 1023px; catalog at 800px; PDP at 700px. Existing tests also exercise 320/768/1024/1280/1920.',
      'No current production mobile/tablet reference. No-overflow and working controls establish local usability only, not parity.',
      `site-header.css: media queries; brand.css: media queries; ${pdpCss}; gh.css`,
      'UNVERIFIED',
    ),
  };
  if (page === 'home') {
    result['product option styling'] = row(
      'Recommendation cards reuse catalog variant swatches and quick-shop controls.',
      unknown +
        ' Below-fold recommendation options are not visible in the saved homepage references.',
      'Products.tsx: ProductCard/QuickShop; product-options.ts: visualOption; brand.css: card swatches',
    );
    result['image sizing'] = row(
      'First suitable catalog product is used as a contained hero image; product/category cards reuse catalog imagery.',
      isFG
        ? 'FG archived homepage: full-width autumn lifestyle photo, copy over right side; image fills the whole hero.'
        : isGH
          ? 'GH composite: full-width outdoor cashmere lifestyle photo with copy over left side. POC uses a white product cutout and split panel.'
          : unknown + ' No usable GR homepage archive.',
      `src/shop/${bodyFile}; brand.css: .hero-photograph/.home-hero/.hero-copy; gh.css equivalents`,
      brand === 'gr'
        ? 'UNVERIFIED'
        : 'P0 OPEN — campaign asset/content required',
    );
    result.spacing = row(
      'Fixed-height split hero; editorial intro, category cards, product grid below.',
      isFG
        ? 'FG archive shows an uninterrupted lifestyle hero immediately below navigation. Exact below-fold spacing not captured.'
        : isGH
          ? 'GH composite shows lifestyle hero immediately below announcement. No below-fold evidence.'
          : unknown,
      `src/shop/${bodyFile}; brand.css: .home-hero/.editorial-intro/.section-space; gh.css home selectors`,
    );
    result['CTA styling'] = row(
      'Single generic Shop the Collection/Shop Now button on solid hero panel.',
      isFG
        ? 'FG archive has two white, black-bordered campaign CTAs over the photograph.'
        : isGH
          ? 'GH composite has one small dark campaign CTA over lifestyle photography.'
          : unknown,
      `src/shop/${bodyFile}; shared/storefronts.ts: home; brand.css: .hero-copy .button; gh.css: .hero-copy .button`,
      brand === 'gr' ? 'UNVERIFIED' : 'OPEN — depends on campaign composition',
    );
  }
  if (listing) {
    result['image sizing'] = row(
      'Three-column desktop catalog grid (home recommendations use four columns), square contained images; two mobile columns. GH assortment includes furniture.',
      unknown +
        ' A matched category/search result set is needed before changing image ratios.',
      'Products.tsx: ProductCard/ProductGrid; brand.css: .shop-grid/.card-visual; gh.css: .card-visual',
    );
    result['product option styling'] = row(
      'Card swatches reflect normalized variants; quick shop opens shared product controls.',
      unknown,
      'Products.tsx: ProductCard/QuickShop; ProductDetails.tsx: ProductInfo; product-options.ts: visualOption',
    );
    result['CTA styling'] = row(
      'Hover Quick Shop, Filter/Sort controls and pagination use generic shared controls.',
      unknown,
      'Products.tsx: QuickShop; Category.tsx: filters/sort/pagination; brand.css: .quick-shop/.catalog-toolbar/.pagination',
    );
    result.spacing = row(
      page === 'search'
        ? 'Search results reuse category title, sidebar and grid; no production suggestion panel.'
        : 'Simple title above left filter sidebar and product grid; no campaign category banner.',
      unknown,
      'Category.tsx: category-intro/catalog-layout/catalog-toolbar; brand.css corresponding selectors',
    );
  }
  if (product) {
    result['image sizing'] = row(
      'Square contained image with left thumbnail strip on desktop and bottom thumbnails on mobile; selected variant images first.',
      isFG
        ? 'FG archive shows large lifestyle image and five visible left thumbnails with arrows; different product prevents crop/size equality.'
        : brand === 'gr'
          ? 'Old GR reference shows large lifestyle image, left thumbnails and overlaid gallery arrows. Current GR indexed product has more image content than the POC.'
          : unknown,
      `ProductDetails.tsx: ProductGallery; product-options.ts: galleryImages; ${pdpCss}: .product-gallery/.gallery-image/.gallery-thumbnails`,
    );
    result['PDP layout'] = row(
      isFG || isGH
        ? '1.4:1 gallery/info grid; item number above title; price separator; option groups; quantity/total; full-width CTA.'
        : '3:2 gallery/info grid; title/item on one line; price; bordered color panel; quantity/total; full-width navy CTA.',
      isFG
        ? 'FG archive has right-aligned item number above title, prominent price rule, separate Color and Type groups and upsell block. POC lacks category-return bar, upsell and equivalent product content.'
        : brand === 'gr'
          ? 'Old GR screenshot puts item below title, includes rating and upsell. New Spark source differs: cannot treat old position/palette as current target.'
          : 'GH reuses FG purchase structure, but no GH PDP production capture is available.',
      `ProductDetails.tsx; ${brand === 'gr' ? 'ProductPurchase.tsx' : 'FrontgateProductInfo.tsx'}; ${pdpCss}; gh.css: PDP overrides`,
    );
    result['product option styling'] = row(
      'Named CSS colors or variant images; selected first variant; FG/GH 64px rounded chips, GR 50px square tiles. Brown currently appears reddish because CSS brown is used.',
      isFG
        ? 'FG archive has textured swatches with separate Color/Type steps. Need actual swatch image/color code, not an invented CSS palette.'
        : brand === 'gr'
          ? 'Current indexed GR product has Choose Color and image swatches; no browser evidence for exact tile border/size. Old archived style tiles are a different product.'
          : unknown,
      'product-options.ts: visualOption; FrontgateProductInfo.tsx: option groups; ProductPurchase.tsx: ColorOptions; fg-pdp.css/gr-pdp.css option selectors',
    );
    result['CTA styling'] = row(
      brand === 'gr'
        ? 'Full-width navy 48px ADD TO CART; quantity/total above.'
        : isGH
          ? 'Full-width taupe ADD TO BAG inherited from shared purchase component.'
          : 'Full-width black 48px ADD TO CART; quantity/total above.',
      isFG
        ? 'Purchase CTA is below the supplied FG screenshot crop: width/height/color not visually verifiable.'
        : brand === 'gr'
          ? 'Old GR reference has short coral disabled CTA; newer Spark uses other tokens. Do not replace current navy based on that old disabled state.'
          : unknown,
      'ProductPurchase.tsx: PurchaseControls; shared/storefronts.ts: pdp; fg-pdp.css/gr-pdp.css: .button.add-to-cart; gh.css',
    );
  }
  if (['cart', 'checkout', 'minicart'].includes(page)) {
    result['cart/minicart'] = row(
      page === 'minicart'
        ? 'Fixed overlay drawer with product image, quantity/remove, subtotal, View Bag and Checkout; one browser-only item.'
        : page === 'cart'
          ? 'Bag items on left, boxed Order Summary on right; coupon placeholder and demo notice.'
          : 'Five-step local demo checkout with full storefront header/footer and merchandise-only summary; no order is placed.',
      unknown + ' No production transaction was attempted.',
      'Cart.tsx: Cart/MiniCart/OrderSummary/CartItem; Checkout.tsx: Checkout/CheckoutStep; brand.css: bag/summary/checkout/drawer sections',
    );
    if (!product)
      result['image sizing'] = row(
        page === 'checkout'
          ? 'Captured contact step has a text-only order summary; review-step product imagery is not separately audited here.'
          : 'Contained product thumbnails in bag rows, with a pale image surface.',
        unknown,
        'Cart.tsx: CartItem; Checkout.tsx: summary items; brand.css: .bag-item-image/.checkout-summary',
      );
  }
  return result;
}

await mkdir('docs', { recursive: true });
let markdown =
  '# Page-by-page visual parity inventory\n\nAll pages remain **OPEN**. See [assessment, evidence and priorities](visual-parity-assessment.md). Each table covers all 12 requested groups. Shared-shell rows are repeated because they apply to every listed route. “Source corrected” is not a production visual sign-off. Before/after screenshots and numeric measurements are in `test-results/visual-parity/`.\n\n';
for (const brand of brands)
  for (const page of pages) {
    markdown += `## ${brand.toUpperCase()} — ${page}\n\n`;
    markdown +=
      '| Group | Current implementation / baseline | Production behavior or evidence gap | Exact code/style area | Status |\n|---|---|---|---|---|\n';
    const entries = observations(brand, page);
    for (const group of groups)
      markdown += `| ${group} | ${entries[group].join(' | ')} |\n`;
    markdown += '\n';
  }
await writeFile('docs/visual-parity-mismatches.md', markdown);

const references = {
  'fg-home': [
    'fg-home-archived.jpg',
    'Archived FG home; 1883×942; capture date unverified.',
  ],
  'fg-pdp': [
    'fg-pdp-reference.jpg',
    'Archived FG PDP; 2048×1152; different product. CTA/footer outside crop.',
  ],
  'gr-pdp': [
    'gr-pdp-archived.png',
    'Old GR Garden Easter Eggs PDP; 2400×1500; includes browser chrome. Not the current Wreath Storage Bag design.',
  ],
  'gh-home': [
    'gh-home-reference.png',
    'GH TrustedSite composite; 1200×660; tiny embedded desktop preview. Not a full-size production screenshot.',
  ],
};
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FG / GR / GH parity audit</title>
<style>body{margin:0;font:15px/1.5 system-ui;color:#20252a;background:#f5f6f7}header{padding:20px;background:white;border-bottom:1px solid #ccd0d3}h1{font-size:24px;margin:0}label{margin-right:20px}select{font:inherit;padding:6px}main{padding:16px}.panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}section{background:white;padding:12px;min-width:0}h2{font-size:18px}.frame{height:75vh;overflow:auto;border:1px solid #ccc}img{display:block;width:100%;height:auto}.actual img{width:auto;max-width:none}p{max-width:1100px}#note{background:#fff2ce;padding:12px}a{color:#164f85}@media(max-width:800px){.panels{grid-template-columns:1fr}}</style>
<header><h1>Visual parity audit — all pages remain open</h1><p>Live production is access-denied. Available archived references are shown only for the applicable desktop page. They have different viewports/products/dates, so this is a qualitative comparison, not a pixel-diff sign-off. Cart/checkout captures use browser-only fixtures based on live products.</p>
<label>Brand <select id="brand">${brands.map((b) => `<option>${b}</option>`).join('')}</select></label><label>Page <select id="page">${pages.map((p) => `<option>${p}</option>`).join('')}</select></label><label>Viewport <select id="viewport"><option>desktop</option><option>tablet</option><option>mobile</option></select></label><label><input type="checkbox" id="actual">Actual image pixels (scroll)</label><p><a href="../../docs/visual-parity-mismatches.md">Full grouped mismatch inventory</a> · <a href="before/manifest.json">Before metrics</a> · <a href="after/manifest.json">After metrics</a></p></header>
<main><p id="note"></p><div class="panels"><section><h2>Production reference</h2><div class="frame" id="reference"></div></section><section><h2>POC before</h2><div class="frame"><img id="before" alt="POC baseline"></div></section><section><h2>POC after</h2><div class="frame"><img id="after" alt="POC after targeted corrections"></div></section></div></main>
<script>const refs=${JSON.stringify(references)};const get=id=>document.getElementById(id);function render(){const b=get('brand').value,p=get('page').value,v=get('viewport').value;get('before').src='before/'+b+'-'+p+'-'+v+'.png';get('after').src='after/'+b+'-'+p+'-'+v+'.png';const ref=v==='desktop'?refs[b+'-'+p]:null;get('reference').replaceChildren();get('note').textContent=ref?ref[1]:'No usable production reference for this page/viewport. Geometry, spacing, CTA, footer and responsive parity remain unverified.';if(ref){const img=document.createElement('img');img.src='../production-reference/'+ref[0];img.alt=ref[1];get('reference').append(img)}document.querySelector('.panels').classList.toggle('actual',get('actual').checked)}for(const id of ['brand','page','viewport','actual'])get(id).addEventListener('change',render);render();</script></html>`;
await mkdir('test-results/visual-parity', { recursive: true });
await writeFile('test-results/visual-parity/index.html', html);
console.log(
  'Wrote 21 page inventories (252 groups) and the side-by-side viewer.',
);
