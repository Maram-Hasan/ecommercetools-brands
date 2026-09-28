import { test, expect, type Page } from '@playwright/test';

const keys = { fg: 'frontgate', gr: 'grandin-road', gh: 'garnethill' };
const id = (n: number) =>
  `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`;
const money = (amount: number) => ({
  amount,
  fractionDigits: 2,
  currencyCode: 'USD',
});
const category = (name: string) => ({
  id: name.toLowerCase(),
  name,
  slug: name.toLowerCase(),
});
function products(brand: keyof typeof keys) {
  return [
    {
      id: id(brand === 'fg' ? 1 : brand === 'gr' ? 2 : 5),
      slug: `${brand}-product-${id(brand === 'fg' ? 1 : brand === 'gr' ? 2 : 5)}`,
      name: `${brand.toUpperCase()} Connected Chair`,
      description: 'Description maintained in commercetools.',
      categories: [
        category('Furniture'),
        { ...category('Chairs'), parentId: 'furniture' },
      ],
      variants: [
        {
          id: 1,
          sku: 'CHAIR-IVORY',
          images: ['/test-assets/lounge.jpg'],
          price: money(34900),
          originalPrice: money(44900),
          attributes: [{ name: 'finish', value: 'Ivory' }],
        },
        {
          id: 2,
          sku: 'CHAIR-WALNUT',
          images: ['/test-assets/chair.jpg'],
          price: money(39900),
          attributes: [{ name: 'finish', value: 'Walnut' }],
        },
        {
          id: 3,
          sku: 'CHAIR-NOPRICE',
          images: [],
          price: null,
          attributes: [{ name: 'finish', value: 'Unpriced' }],
        },
      ],
    },
    {
      id: id(brand === 'fg' ? 3 : brand === 'gr' ? 4 : 6),
      name: `${brand.toUpperCase()} Connected Sofa`,
      slug: `${brand}-connected-sofa`,
      description: 'Another published store product.',
      categories: [
        category('Furniture'),
        { ...category('Sofas'), parentId: 'furniture' },
      ],
      variants: [
        {
          id: 1,
          sku: 'SOFA',
          images: ['/test-assets/sofa.jpg'],
          price: money(129900),
        },
      ],
    },
  ];
}

test('GR and FG galleries use the GH media stack and mobile carousel behavior', async ({
  page,
}, info) => {
  for (const brand of ['gr', 'fg'] as const) {
    const product = products(brand)[0];
    product.variants[0].images = Array.from(
      { length: 8 },
      (_, index) => `/test-assets/lounge.jpg?view=${index}`,
    );
    await page.route(`**/api/products/${product.id}?*`, (route) =>
      route.fulfill({ json: product }),
    );
    await page.goto(`/${brand}/product/${product.id}`);
    const gallery = page.locator('.product-gallery');
    const main = gallery.locator('.gallery-main');
    const thumbnails = gallery.locator('.gallery-thumbnails');
    await expect(thumbnails.getByRole('button')).toHaveCount(9);
    if (info.project.name === 'mobile') {
      for (const width of [320, 390, 700]) {
        await page.setViewportSize({ width, height: 844 });
        const geometry = await gallery.evaluate((element) => {
          const main = element.querySelector('.gallery-main')!;
          const strip = element.querySelector('.gallery-thumbnails')!;
          const mainRect = main.getBoundingClientRect();
          const stripRect = strip.getBoundingClientRect();
          return {
            width: mainRect.width,
            left: mainRect.left,
            stripWidth: stripRect.width,
            below: stripRect.top >= mainRect.bottom,
            stripOverflows: strip.scrollWidth > strip.clientWidth,
            mainOverflows: main.scrollWidth > main.clientWidth,
            pageWidth: document.documentElement.scrollWidth,
          };
        });
        expect(geometry).toEqual({
          width,
          left: 0,
          stripWidth: width,
          below: true,
          stripOverflows: true,
          mainOverflows: true,
          pageWidth: width,
        });
      }
      await page.setViewportSize({ width: 390, height: 844 });
    } else {
      for (const viewport of [main, thumbnails]) {
        expect(
          await viewport.evaluate((element) => ({
            bounded: element.scrollHeight > element.clientHeight,
            overflow: getComputedStyle(element).overflowY,
          })),
        ).toEqual({ bounded: true, overflow: 'auto' });
      }
      const strip = await thumbnails.boundingBox();
      const media = await main.boundingBox();
      expect(strip!.x + strip!.width).toBeLessThan(media!.x);
    }
    await thumbnails
      .getByRole('button', { name: 'View image 4', exact: true })
      .click();
    await expect
      .poll(() =>
        main.evaluate((element) => {
          const panel = element
            .querySelectorAll('.gallery-panel')[3]
            .getBoundingClientRect();
          const viewport = element.getBoundingClientRect();
          return Math.round(
            window.innerWidth <= 700
              ? panel.left - viewport.left
              : panel.top - viewport.top,
          );
        }),
      )
      .toBe(0);
    await expect(
      thumbnails.getByRole('button', { name: 'View image 4', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await gallery
      .getByRole('button', { name: 'Enlarge product image 4', exact: true })
      .click();
    await expect(page.getByRole('dialog').locator('img')).toHaveAttribute(
      'src',
      '/test-assets/lounge.jpg?view=3',
    );
    await page.keyboard.press('Escape');
    if (info.project.name === 'mobile') {
      await main.evaluate((element) =>
        element.scrollTo({
          left: element.clientWidth * 7,
          behavior: 'instant',
        }),
      );
      await expect(
        thumbnails.getByRole('button', { name: 'View image 8', exact: true }),
      ).toHaveAttribute('aria-pressed', 'true');
      await expect
        .poll(() =>
          thumbnails.evaluate((element) => {
            const selected = element
              .querySelector('[aria-pressed="true"]')!
              .getBoundingClientRect();
            const strip = element.getBoundingClientRect();
            return selected.left >= strip.left && selected.right <= strip.right;
          }),
        )
        .toBe(true);
    }
    await gallery.screenshot({
      path: `test-results/${brand}-${info.project.name}-responsive-gallery.png`,
    });
  }
});

test('catalog badge arrays render separate labels on cards and product pages for every brand', async ({
  page,
}, info) => {
  for (const brand of ['fg', 'gr', 'gh'] as const) {
    const collection = products(brand);
    const badges = ['NEW', 'EXCLUSIVE', 'Soft, durable'];
    const badged = { ...collection[0], badges };
    await page.route(`**/api/products?*`, (route) =>
      route.fulfill({
        json: {
          products: [badged, collection[1]],
          total: 2,
          offset: 0,
          limit: 24,
        },
      }),
    );
    await page.route(`**/api/products/by-slug/${badged.slug}?*`, (route) =>
      route.fulfill({ json: badged }),
    );
    await page.goto(`/${brand}/category/furniture`);
    const cards = page.locator('.catalog-results .shop-product-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.first().locator('.product-badge')).toHaveText(badges);
    await expect(cards.nth(1).locator('.product-badges')).toHaveCount(0);
    const bounds = await cards.first().evaluate((element) => {
      const card = element.getBoundingClientRect();
      const badges = [...element.querySelectorAll('.product-badge')].map(
        (badge) => badge.getBoundingClientRect(),
      );
      return badges.every(
        (badge, index) =>
          badge.left >= card.left &&
          badge.right <= card.right &&
          (!index || badge.top >= badges[index - 1].bottom),
      );
    });
    expect(bounds).toBe(true);
    await cards.first().screenshot({
      path: `test-results/${brand}-${info.project.name}-badges.png`,
    });
    await cards
      .first()
      .getByRole('link', { name: badged.name, exact: true })
      .click();
    await expect(page.locator('.product-info-panel .product-badge')).toHaveText(
      badges,
    );
    await expect(
      page.locator('.variant-attributes dt').filter({ hasText: /^badge$/ }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
});

test('mobile PDP summary precedes the carousel and touch gestures scroll the page for all brands', async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== 'mobile',
    'Touch behavior and mobile summary',
  );
  test.setTimeout(90000);
  const session = await page.context().newCDPSession(page);
  const swipe = async (x: number, y: number, dx: number, dy: number) => {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 10; step++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + (dx * step) / 10, y: y + (dy * step) / 10 }],
      });
      await page.waitForTimeout(25);
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  };
  for (const brand of ['fg', 'gr', 'gh'] as const) {
    const product = {
      ...products(brand)[0],
      badges: ['New Color', 'Exclusive'],
    };
    product.variants[0].images = Array.from(
      { length: 5 },
      (_, index) => `/test-assets/lounge.jpg?view=${index}`,
    );
    await page.route(`**/api/products/${product.id}?*`, (route) =>
      route.fulfill({ json: product }),
    );
    await page.goto(`/${brand}/product/${product.id}`);
    const panel = page.locator('.product-info-panel');
    const gallery = page.locator('.product-gallery');
    const main = gallery.locator('.gallery-main');
    await expect(panel.locator('.product-badge')).toHaveText(product.badges);
    for (const width of [320, 390, 700]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(
        page.getByRole('heading', { name: product.name, exact: true }),
      ).toHaveCount(1);
      const geometry = await panel.evaluate((element) => {
        const rect = (selector: string) =>
          element.querySelector(selector)!.getBoundingClientRect();
        const gallery = rect('.product-gallery');
        const heading = rect('h1');
        const sku = rect('.sku');
        return {
          summaryAbove: [
            '.product-heading-row',
            '.product-badges',
            '.shop-price',
          ].every((selector) => rect(selector).bottom <= gallery.top),
          skuOnRight: sku.left >= heading.right,
          sameRow: sku.top < heading.bottom && sku.bottom > heading.top,
          optionsBelow: rect('fieldset').top >= gallery.bottom,
          galleryWidth: gallery.width,
          pageWidth: document.documentElement.scrollWidth,
        };
      });
      expect(geometry).toEqual({
        summaryAbove: true,
        skuOnRight: true,
        sameRow: true,
        optionsBelow: true,
        galleryWidth: width,
        pageWidth: width,
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    for (const viewport of [main, gallery.locator('.gallery-thumbnails')]) {
      await viewport.evaluate((element) =>
        element.scrollIntoView({ block: 'center' }),
      );
      const rect = await viewport.boundingBox();
      const before = await page.evaluate(() => window.scrollY);
      await expect(viewport).toHaveCSS('overscroll-behavior-y', 'auto');
      await swipe(
        Math.round(rect!.x + rect!.width / 2),
        Math.round(rect!.y + rect!.height / 2),
        0,
        -180,
      );
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(before + 40);
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
    await main.evaluate((element) =>
      element.scrollIntoView({ block: 'center' }),
    );
    const rect = await main.boundingBox();
    await swipe(
      Math.round(rect!.x + rect!.width * 0.85),
      Math.round(rect!.y + rect!.height / 2),
      -260,
      0,
    );
    await expect
      .poll(() => main.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(100);
    await page
      .getByRole('button', { name: 'Choose Walnut', exact: true })
      .click();
    await expect(panel.locator('.sku')).toContainText('CHAIR-WALNUT');
    await expect(panel.locator('.shop-price')).toContainText('$399.00');
    await expect(panel.locator('.product-badge')).toHaveText(product.badges);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/${brand}-mobile-summary.png` });
  }
});

test.beforeEach(async ({ page }) => {
  await page.route('**/test-assets/*', (route) => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    if (!['lounge.jpg', 'chair.jpg', 'sofa.jpg'].includes(name ?? ''))
      return route.abort();
    return route.fulfill({ path: `tests/fixtures/catalog-images/${name}` });
  });
  const bags = new Map<
    string,
    {
      product: ReturnType<typeof products>[number];
      variantId: number;
      quantity: number;
    }
  >();
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const storeKey = url.searchParams.get('store')!;
    expect(Object.values(keys)).toContain(storeKey);
    const brand =
      storeKey === keys.fg ? 'fg' : storeKey === keys.gr ? 'gr' : 'gh';
    const collection = products(brand);
    if (url.pathname === '/api/products')
      return route.fulfill({
        json: {
          products: collection,
          total: collection.length,
          offset: 0,
          limit: 24,
        },
      });
    if (url.pathname.startsWith('/api/products/')) {
      const product = collection.find(
        (item) =>
          item.id === url.pathname.split('/').pop() ||
          item.slug === decodeURIComponent(url.pathname.split('/').pop()!),
      );
      return route.fulfill(
        product
          ? { json: product }
          : {
              status: 404,
              json: { message: 'Product not found in this Store.' },
            },
      );
    }
    if (url.pathname.startsWith('/api/cart')) {
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        const product = collection.find((item) => item.id === body.productId)!;
        expect(product).toBeTruthy();
        expect(
          product.variants.some(
            (variant) => variant.id === body.variantId && variant.price,
          ),
        ).toBe(true);
        const previous = bags.get(storeKey);
        bags.set(storeKey, {
          product,
          variantId: body.variantId,
          quantity: (previous?.quantity ?? 0) + body.quantity,
        });
      }
      if (request.method() === 'PATCH') {
        const entry = bags.get(storeKey)!;
        entry.quantity = request.postDataJSON().quantity;
        if (!entry.quantity) bags.delete(storeKey);
      }
      const entry = bags.get(storeKey);
      if (!entry) return route.fulfill({ json: null });
      const variant = entry.product.variants.find(
        (v) => v.id === entry.variantId,
      )!;
      const total = money(variant.price!.amount * entry.quantity);
      return route.fulfill({
        json: {
          quantity: entry.quantity,
          total,
          items: [
            {
              id: id(99),
              productId: entry.product.id,
              name: entry.product.name,
              sku: variant.sku,
              image: variant.images[0],
              price: variant.price,
              total,
              quantity: entry.quantity,
            },
          ],
        },
      });
    }
    return route.fulfill({
      status: 404,
      json: { message: 'Unexpected endpoint.' },
    });
  });
});

async function screenshot(page: Page, name: string, viewport: string) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/commerce-${name}-${viewport}.png`,
    fullPage: true,
  });
}

for (const brand of ['fg', 'gr', 'gh'] as const) {
  test(`${brand}: commercetools catalog, variants, persistent cart and demo checkout`, async ({
    page,
  }, info) => {
    const product = products(brand)[0];
    const addButton = brand === 'gh' ? 'Add To Bag' : 'ADD TO CART';
    const mutations: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/') && request.method() !== 'GET')
        mutations.push(request.method());
    });
    await page.goto('/' + brand);
    await expect(page.locator('.shop-product-card')).toHaveCount(2);
    await expect(
      page.getByText('Sample collection', { exact: false }),
    ).toHaveCount(0);
    await screenshot(page, brand + '-home', info.project.name);
    await page.locator('.hero-copy .button').click();
    await expect(page).toHaveURL(
      new RegExp('/' + brand + '/category/all-products'),
    );
    const ghMobile = brand === 'gh' && info.project.name === 'mobile';
    const mobileFilters = info.project.name === 'mobile';
    if (info.project.name === 'mobile')
      await page.getByRole('button', { name: 'Filter & Sort' }).click();
    if (mobileFilters)
      await page
        .getByRole('dialog')
        .locator('summary')
        .filter({ hasText: ghMobile ? 'Category' : 'Type' })
        .click();
    else if (brand === 'gh')
      await page
        .locator('.gh-departments details')
        .filter({ hasText: 'Chairs' })
        .locator('summary')
        .click();
    const filterArea = mobileFilters
      ? page.getByRole('dialog')
      : page.locator('.filters');
    await filterArea.getByLabel('Chairs', { exact: true }).check();
    await expect(page.locator('.shop-product-card')).toHaveCount(1);
    if (mobileFilters || brand === 'gh' || brand === 'gr')
      await filterArea.getByLabel('Chairs', { exact: true }).uncheck();
    else
      await page
        .getByRole('button', { name: 'Clear all', exact: true })
        .click();
    if (mobileFilters) {
      await page
        .getByRole('radio', {
          name: ghMobile ? 'Price: Low to High' : 'Price:(High to Low)',
          exact: true,
        })
        .check();
      await page.getByRole('button', { name: /^View 2 Items$/i }).click();
    } else await page.getByLabel('Sort by').selectOption('high');
    await expect(page.locator('.shop-product-card').first()).toContainText(
      ghMobile ? 'Connected Chair' : 'Connected Sofa',
    );
    await screenshot(page, brand + '-category', info.project.name);
    if (brand === 'gh' && info.project.name === 'desktop') {
      const container = await page.locator('.category-page').boundingBox();
      const productImage = await page
        .locator('.shop-product-card .card-visual')
        .first()
        .boundingBox();
      expect(container).not.toBeNull();
      expect(productImage).not.toBeNull();
      expect(container!.x).toBeGreaterThan(0);
      expect(container!.width).toBeLessThanOrEqual(1240);
      expect(productImage!.width).toBeLessThanOrEqual(325);
    }
    await page.goto(`/${brand}/product/${product.id}`);
    await expect(
      page.getByRole('heading', { name: product.name, exact: true }),
    ).toBeVisible();
    await expect(page.locator('.product-info-panel .shop-price')).toContainText(
      '$349.00',
    );
    await expect(page.locator('.product-info-panel del')).toContainText(
      '$449.00',
    );
    const unpricedOption = page.getByRole('button', {
      name: 'Choose Unpriced',
      exact: true,
    });
    if (brand === 'gh') {
      await expect(unpricedOption).toBeDisabled();
      await expect(unpricedOption).toHaveClass(/gh-option-unavailable/);
    } else {
      await unpricedOption.click();
      await expect(
        page.getByRole('button', { name: addButton, exact: true }),
      ).toBeDisabled();
    }
    await page
      .getByRole('button', { name: 'Choose Walnut', exact: true })
      .click();
    await expect(page.locator('.product-info-panel .shop-price')).toContainText(
      '$399.00',
    );
    await screenshot(page, brand + '-pdp', info.project.name);
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    if (brand === 'gh')
      await expect(
        page.locator('.gh-purchase-row .quantity-selector output'),
      ).toHaveText('2');
    else
      await expect(
        page.getByRole('status', { name: 'Product total' }),
      ).toHaveText('$798.00');
    await page.getByRole('button', { name: addButton, exact: true }).click();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('heading', { name: 'In Your Bag (2)' }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText(product.name);
    await expect(
      page.getByRole('button', { name: 'Sample Bag', exact: false }),
    ).toHaveCount(0);
    await screenshot(page, brand + '-minicart', info.project.name);
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'View Bag', exact: true })
      .click();
    await page.reload();
    await expect(page.locator('.bag-item')).toHaveCount(1);
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(page.locator('.quantity-selector output')).toHaveText('3');
    await screenshot(page, brand + '-cart', info.project.name);
    await page.getByRole('link', { name: 'Continue to Checkout' }).click();
    await screenshot(page, brand + '-checkout', info.project.name);
    await page
      .getByLabel('Email address', { exact: true })
      .fill('demo@example.com');
    await page.getByRole('button', { name: 'Continue to Shipping' }).click();
    for (const [label, value] of [
      ['First name', 'Demo'],
      ['Last name', 'Shopper'],
      ['Street address', '123 Test Lane'],
      ['City', 'Austin'],
      ['State / Region', 'TX'],
      ['ZIP / Postal code', '78701'],
    ])
      await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole('button', { name: 'Continue to Delivery' }).click();
    await page.getByRole('button', { name: 'Continue to Payment' }).click();
    await page.getByLabel('Try a declined demo payment').check();
    await page.getByRole('button', { name: 'Review Your Order' }).click();
    await expect(page.getByRole('alert')).toContainText('declined');
    await page.getByLabel('Approved demo payment').check();
    await page.getByRole('button', { name: 'Review Your Order' }).click();
    await page
      .getByLabel('I understand this completes a demo, with no purchase.')
      .check();
    await page.getByRole('button', { name: 'Complete Demo Order' }).click();
    await expect(
      page.getByRole('heading', { name: 'A beautiful beginning.' }),
    ).toBeVisible();
    expect(mutations).toEqual(['POST', 'PATCH']);
    await page.goto(`/${brand}/cart`);
    await expect(page.locator('.quantity-selector output')).toHaveText('3');
  });
}

test('brand changes use new Store keys and keep carts isolated', async ({
  page,
}) => {
  await page.goto('/fg/product/' + id(1));
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Choose brand' })
    .getByRole('link', { name: 'Grandin Road' })
    .click();
  await expect(page.locator('.shop-product-card').first()).toContainText(
    'GR Connected Chair',
  );
  await page.getByRole('link', { name: 'Open shopping bag, 0 items' }).click();
  await expect(page).toHaveURL(/\/gr\/cart$/);
  await expect(
    page.getByRole('heading', { name: 'Your next favorite is waiting.' }),
  ).toBeVisible();
  await page.goto('/fg/cart');
  await page
    .getByRole('navigation', { name: 'Choose brand' })
    .getByRole('link', { name: 'Garnet Hill' })
    .click();
  await expect(page.locator('.shop-product-card').first()).toContainText(
    'GH Connected Chair',
  );
  await expect(
    page.getByRole('link', { name: 'Open shopping bag, 0 items' }),
  ).toBeVisible();
  await page.goto('/gh/product/' + id(5));
  await page.getByRole('button', { name: 'Add To Bag', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('GH Connected Chair');
  await page.keyboard.press('Escape');
  await page.goto('/gr/cart');
  await expect(
    page.getByRole('heading', { name: 'Your next favorite is waiting.' }),
  ).toBeVisible();
  await page.goto('/gh/cart');
  await expect(page.locator('.bag-item')).toContainText('GH Connected Chair');
  await page.goto('/fg/cart');
  await expect(page.locator('.bag-item')).toContainText('FG Connected Chair');
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your next favorite is waiting.' }),
  ).toBeVisible();
});

test('bag hover opens the mini cart for every storefront', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'Hover behavior is desktop-only',
  );
  for (const brand of ['fg', 'gr', 'gh'] as const) {
    await page.goto(`/${brand}`);
    await page
      .getByRole('link', {
        name: 'Open shopping bag, 0 items',
      })
      .hover();
    await expect(
      page
        .getByRole('dialog')
        .getByRole('heading', { name: 'In Your Bag (0)' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});

test('brand header cart links stay clickable during hover and mobile breadcrumbs show the latest category', async ({
  page,
}, info) => {
  for (const brand of ['gh', 'gr', 'fg'] as const) {
    const product = products(brand)[0];
    await page.goto(`/${brand}/product/${product.id}`);
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(
      page.getByRole('heading', { name: product.name, exact: true }),
    ).toBeVisible();
    if (info.project.name === 'mobile') {
      await expect(breadcrumb.locator(':scope > :visible')).toHaveCount(1);
      await expect(
        breadcrumb.getByRole('link', { name: 'Chairs', exact: true }),
      ).toBeVisible();
      await expect(
        breadcrumb.getByRole('link', { name: 'Home', exact: true }),
      ).toBeHidden();
      await expect(breadcrumb.locator('[aria-current]')).toBeHidden();
    } else {
      await expect(breadcrumb.locator(':scope > :visible')).toHaveCount(4);
      await expect(
        breadcrumb.getByRole('link', { name: 'Home', exact: true }),
      ).toBeVisible();
      await expect(breadcrumb.locator('[aria-current]')).toHaveText(
        product.name,
      );
    }
    await breadcrumb.getByRole('link', { name: 'Chairs', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${brand}/category/chairs$`));
    if (info.project.name === 'mobile') {
      await expect(breadcrumb.locator(':scope > :visible')).toHaveCount(1);
      await expect(breadcrumb.locator('[aria-current]')).toHaveText('Chairs');
    }
    const cartLink = page.getByRole('link', {
      name: 'Open shopping bag, 0 items',
      exact: true,
    });
    await expect(cartLink).toHaveAttribute('href', `/${brand}/cart`);
    if (info.project.name === 'desktop') {
      await cartLink.hover();
      const preview = page.getByRole('dialog', { name: 'In Your Bag (0)' });
      await expect(preview).toBeVisible();
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
        'hidden',
      );
      await expect(cartLink).toBeVisible();
      await cartLink.click();
    } else {
      await cartLink.tap();
    }
    await expect(page).toHaveURL(new RegExp(`/${brand}/cart$`));
    await expect(
      page.getByRole('heading', { name: 'Your Shopping Bag', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.mouse.move(0, 0);
    await page.goto(`/${brand}`);
    await cartLink.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/${brand}/cart$`));
  }
});

test('categories, search and quick view use API data', async ({
  page,
}, info) => {
  await page.goto('/gr');
  if (await page.getByRole('button', { name: 'Open navigation' }).isVisible()) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page
      .getByRole('dialog')
      .getByRole('link', { name: 'FURNITURE', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  } else
    await page
      .locator('.desktop-navigation')
      .getByRole('link', { name: 'FURNITURE', exact: true })
      .click();
  await expect(page).toHaveURL(/\/gr\/category\/furniture/);
  if (await page.getByRole('button', { name: 'Filter & Sort' }).isVisible()) {
    await page.getByRole('button', { name: 'Filter & Sort' }).click();
    await page
      .getByRole('dialog')
      .locator('summary')
      .filter({ hasText: 'Type' })
      .click();
    await page
      .getByRole('dialog')
      .getByLabel('Chairs', { exact: true })
      .check();
    await page.getByRole('button', { name: /^View 1 Items$/i }).click();
  } else await page.getByLabel('Chairs', { exact: true }).check();
  await expect(page.locator('.shop-product-card')).toHaveCount(1);
  await page.locator('.shop-product-card').first().hover();
  await page.getByRole('button', { name: 'Quick View', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('GR Connected Chair');
  await page.keyboard.press('Escape');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('sofa');
  await page.getByRole('button', { name: 'Submit search' }).click();
  await expect(page.locator('.shop-product-card')).toHaveCount(1);
  await expect(page.locator('.shop-product-card')).toContainText(
    'GR Connected Sofa',
  );
  await page.goto('/gr/product/beaumont-accent-chair');
  await expect(page.getByRole('alert')).toContainText('Product not found');
});

test('responsive shell keeps navigation, imagery and footer usable', async ({
  page,
}, info) => {
  for (const brand of ['fg', 'gr', 'gh']) {
    await page.goto('/' + brand);
    await expect(page.locator('.shop-product-card')).toHaveCount(2);
    await expect(
      page.getByText('STOREFRONT PREVIEW', { exact: true }),
    ).toHaveCount(0);
    const menu = page.getByRole('button', { name: 'Open navigation' });
    if (await menu.isVisible()) {
      await menu.click();
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      expect((await drawer.boundingBox())!.x).toBe(0);
      await screenshot(page, brand + '-navigation', info.project.name);
      await page.keyboard.press('Escape');
      await expect(drawer).toHaveCount(0);
      const footer = page.locator('.site-footer');
      const toggle = footer.getByRole('button', {
        name: 'Customer Service',
        exact: true,
      });
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(
        footer.getByRole('button', { name: 'Contact Us', exact: true }),
      ).toBeVisible();
      await toggle.click();
      await expect(
        footer.getByRole('button', { name: 'Contact Us', exact: true }),
      ).toBeHidden();
    }
    if (info.project.name === 'desktop') {
      for (const width of [320, 768, 1024, 1280, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await screenshot(page, brand + '-responsive-' + width, 'desktop');
        const logo = await page
          .locator('.brand-header .brand-wordmark')
          .boundingBox();
        const cart = await page.locator('.cart-action').boundingBox();
        expect(logo!.x + logo!.width).toBeLessThanOrEqual(cart!.x);
        if (brand === 'gh') {
          const hero = await page.locator('.home-hero').boundingBox();
          const cta = await page.locator('.hero-copy .button').boundingBox();
          expect(cta!.y).toBeGreaterThanOrEqual(hero!.y);
          expect(cta!.y + cta!.height).toBeLessThanOrEqual(
            hero!.y + hero!.height,
          );
          await expect(page.locator('.hero-copy .button')).toBeInViewport();
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
  }
});

test('each brand shares one header across home, category, PDP, cart and checkout', async ({
  page,
}, info) => {
  for (const brand of ['fg', 'gr', 'gh'] as const) {
    let height: number | undefined;
    let labels: string[] | undefined;
    for (const path of [
      '',
      '/category/all-products',
      `/product/${products(brand)[0].id}`,
      '/cart',
      '/checkout',
    ]) {
      await page.goto(`/${brand}${path}`);
      const header = page.locator('.site-header');
      await expect(
        header.locator(
          brand === 'gh'
            ? 'a[href="/gh/category/all-products?q=bedding"]'
            : `a[href="/${brand}/category/furniture"]`,
        ),
      ).toHaveCount(1);
      const box = await header.boundingBox();
      const currentLabels = await header
        .locator('.production-navigation a')
        .allTextContents();
      if (height === undefined) {
        height = box!.height;
        labels = currentLabels;
      } else {
        expect(box!.height).toBe(height);
        expect(currentLabels).toEqual(labels);
      }
      await expect(header.locator('.production-navigation a')).toHaveCount(
        brand === 'fg' ? 9 : brand === 'gr' ? 10 : 7,
      );
      await expect(header.locator('.production-subnavigation')).toHaveCount(
        brand === 'fg' ? 0 : 1,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      if (!path)
        await header.screenshot({
          path: `test-results/${brand}-shared-header-${info.project.name}.png`,
        });
    }
  }
});

test('GR production PDP uses real swatches, gallery, inventory and quantity totals', async ({
  page,
}, info) => {
  const product = {
    id: id(80),
    name: 'Wreath Storage Bag',
    description: 'Store-maintained description.',
    categories: [
      category('Seasonal'),
      { ...category('Storage & Essentials'), parentId: 'seasonal' },
    ],
    variants: [
      {
        id: 1,
        sku: '159041 RED',
        images: ['/test-assets/lounge.jpg', '/test-assets/lounge.jpg?detail=1'],
        price: money(3900),
        available: true,
        attributes: [{ name: 'Color', value: 'Red' }],
      },
      {
        id: 2,
        sku: '159041 GREEN',
        images: ['/test-assets/chair.jpg', '/test-assets/chair.jpg?detail=1'],
        price: money(4900),
        attributes: [{ name: 'Color', value: 'Green' }],
      },
      {
        id: 3,
        sku: '159041 BLACK',
        images: ['/test-assets/sofa.jpg'],
        price: money(5900),
        available: false,
        attributes: [{ name: 'Color', value: 'Black' }],
      },
      {
        id: 4,
        sku: '159041 PATTERN',
        images: [],
        price: null,
        attributes: [{ name: 'Color', value: 'Pattern' }],
      },
    ],
  };
  await page.route(`**/api/products/${product.id}?*`, (route) =>
    route.fulfill({ json: product }),
  );
  let added: unknown;
  await page.route('**/api/cart/items?*', async (route) => {
    added = route.request().postDataJSON();
    expect(new URL(route.request().url()).searchParams.get('store')).toBe(
      'grandin-road',
    );
    await route.fulfill({
      json: {
        quantity: 2,
        total: money(9800),
        items: [
          {
            id: 'line',
            productId: product.id,
            name: product.name,
            sku: '159041 GREEN',
            image: '/test-assets/chair.jpg',
            price: money(4900),
            total: money(9800),
            quantity: 2,
          },
        ],
      },
    });
  });
  await page.goto(`/gr/product/${product.id}`);
  await expect(page.locator('.product-heading-row h1')).toHaveText(
    'Wreath Storage Bag',
  );
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveText(
    'Home>Seasonal>Storage & Essentials>Wreath Storage Bag',
  );
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(page.locator('.color-option')).toHaveCount(4);
  await expect(page.locator('.gallery-thumbnails button')).toHaveCount(5);
  await expect(page.getByRole('status', { name: 'Product total' })).toHaveText(
    '$39.00',
  );
  await page.getByRole('button', { name: 'View image 2', exact: true }).click();
  await expect(
    page.locator('.gallery-panel.selected .gallery-image img'),
  ).toHaveAttribute('src', '/test-assets/lounge.jpg?detail=1');
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(page.getByRole('status', { name: 'Product total' })).toHaveText(
    '$78.00',
  );
  await page.getByRole('button', { name: 'Choose Black', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'ADD TO CART', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('.variant-availability')).toHaveText(
    'Currently unavailable',
  );
  await page
    .getByRole('button', { name: 'Choose Pattern', exact: true })
    .click();
  await expect(page.getByRole('status', { name: 'Product total' })).toHaveText(
    'Price unavailable',
  );
  await expect(
    page.getByRole('button', { name: 'ADD TO CART', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Choose Green', exact: true }).click();
  await expect(page.locator('.product-heading-row .sku')).toHaveText(
    'SKU: 159041 GREEN',
  );
  await expect(
    page.locator('.gallery-panel.selected .gallery-image img'),
  ).toHaveAttribute('src', '/test-assets/chair.jpg');
  await expect(page.getByRole('status', { name: 'Product total' })).toHaveText(
    '$98.00',
  );
  await expect(page.locator('.variant-availability')).toHaveCount(0);
  await expect(page.locator('.product-info-panel .shop-price')).toHaveText(
    '$49.00',
  );
  await expect(
    page.getByRole('button', { name: 'Choose Green', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: 'ADD TO CART', exact: true }),
  ).toHaveCSS('background-color', 'rgb(25, 60, 86)');
  await expect(page.getByText('You may also love')).toHaveCount(0);
  await screenshot(page, 'gr-production-pdp', info.project.name);
  const gallery = await page.locator('.product-gallery').boundingBox();
  const details = await page.locator('.product-info-panel').boundingBox();
  if (info.project.name === 'mobile')
    expect(details!.y).toBeLessThan(gallery!.y);
  else expect(details!.x).toBeGreaterThan(gallery!.x);
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText(product.name);
  expect(added).toEqual({ productId: product.id, variantId: 2, quantity: 2 });
});

test('FG PDP size selection updates images, SKU, price and purchase availability', async ({
  page,
}, info) => {
  const product = {
    ...products('fg')[0],
    name: 'Store Rug Pad',
    variants: [
      {
        id: 1,
        sku: 'PAD-SMALL',
        images: ['/test-assets/lounge.jpg', '/test-assets/lounge.jpg?detail=1'],
        price: money(4900),
        available: true,
        attributes: [{ name: 'size', value: '3 x 5' }],
      },
      {
        id: 2,
        sku: 'PAD-LARGE',
        images: ['/test-assets/chair.jpg', '/test-assets/chair.jpg?detail=1'],
        price: money(8900),
        available: true,
        attributes: [{ name: 'size', value: '5 x 8' }],
      },
      {
        id: 3,
        sku: 'PAD-ROUND',
        images: [],
        price: money(10900),
        available: false,
        attributes: [{ name: 'size', value: '7 Round' }],
      },
      {
        id: 4,
        sku: 'PAD-RUNNER',
        images: [],
        price: null,
        attributes: [{ name: 'size', value: 'Runner' }],
      },
    ],
  };
  await page.route(`**/api/products/${product.id}?*`, (route) =>
    route.fulfill({ json: product }),
  );
  await page.goto(`/fg/product/${product.id}`);
  const add = page.getByRole('button', { name: 'ADD TO CART', exact: true });
  await expect(
    page.getByRole('group', { name: 'Size: 3 x 5', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.tile-option')).toHaveCount(4);
  await page
    .getByRole('button', { name: 'Choose 7 Round', exact: true })
    .click();
  await expect(add).toBeDisabled();
  await expect(page.locator('.variant-availability')).toHaveText(
    'Currently unavailable',
  );
  await page
    .getByRole('button', { name: 'Choose Runner', exact: true })
    .click();
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: 'Choose 5 x 8', exact: true }).click();
  await expect(add).toBeEnabled();
  await expect(page.locator('.product-heading-row .sku')).toHaveText(
    'SKU: PAD-LARGE',
  );
  await expect(
    page.locator('.gallery-panel.selected .gallery-image img'),
  ).toHaveAttribute('src', '/test-assets/chair.jpg');
  await expect(page.locator('.product-info-panel .shop-price')).toHaveText(
    '$89.00',
  );
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(page.getByRole('status', { name: 'Product total' })).toHaveText(
    '$178.00',
  );
  await screenshot(page, 'fg-size-pdp', info.project.name);
  const gallery = await page.locator('.product-gallery').boundingBox();
  const details = await page.locator('.product-info-panel').boundingBox();
  if (info.project.name === 'mobile')
    expect(details!.y).toBeLessThan(gallery!.y);
  else expect(details!.x).toBeGreaterThan(gallery!.x);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
});

test('GH color and size choices preserve real variants, price, gallery and bag identity', async ({
  page,
}, info) => {
  const product = {
    ...products('gh')[0],
    name: 'Catalog Wool Dress',
    categories: [category('Clothing')],
    variants: [
      {
        id: 1,
        sku: 'DRESS-BLACK-S',
        images: [
          '/test-assets/lounge.jpg',
          '/test-assets/lounge.jpg?detail=1',
          '/test-assets/lounge.jpg?detail=3',
        ],
        price: money(12900),
        originalPrice: money(17900),
        available: true,
        attributes: [
          { name: 'color', value: 'Black' },
          { name: 'colorHex', value: '#222222' },
          { name: 'size', value: 'S' },
        ],
      },
      {
        id: 2,
        sku: 'DRESS-BLACK-M',
        images: ['/test-assets/chair.jpg', '/test-assets/chair.jpg?detail=1'],
        price: money(13900),
        available: true,
        attributes: [
          { name: 'color', value: 'Black' },
          { name: 'colorHex', value: '#222222' },
          { name: 'size', value: 'M' },
        ],
      },
      {
        id: 3,
        sku: 'DRESS-GREY-M',
        images: ['/test-assets/sofa.jpg', '/test-assets/sofa.jpg?detail=1'],
        price: money(14900),
        available: false,
        attributes: [
          { name: 'color', value: 'Grey' },
          { name: 'colorHex', value: '#999999' },
          { name: 'size', value: 'M' },
        ],
      },
      {
        id: 4,
        sku: 'DRESS-IVORY-S',
        images: ['/test-assets/lounge.jpg?detail=2'],
        price: null,
        attributes: [
          { name: 'color', value: 'Ivory' },
          { name: 'colorHex', value: '#fffff0' },
          { name: 'size', value: 'S' },
        ],
      },
    ],
  };
  await page.route(`**/api/products/${product.id}?*`, (route) =>
    route.fulfill({ json: product }),
  );
  let addition: unknown;
  await page.route('**/api/cart/items?store=garnethill', (route) => {
    addition = route.request().postDataJSON();
    return route.fulfill({
      json: { quantity: 2, total: money(27800), items: [] },
    });
  });
  await page.goto(`/gh/product/${product.id}`);
  const panel = page.getByRole('region', { name: 'Product information' });
  const add = page.getByRole('button', { name: 'Add To Bag', exact: true });
  if (info.project.name !== 'mobile') {
    const galleryViewport = page.locator('.gh-product-gallery .gallery-main');
    const thumbnailViewport = page.locator(
      '.gh-product-gallery .gallery-thumbnails',
    );
    expect(
      await galleryViewport.evaluate((element) => ({
        bounded: element.scrollHeight > element.clientHeight,
        overflowY: getComputedStyle(element).overflowY,
        scrollbarWidth: getComputedStyle(element).scrollbarWidth,
      })),
    ).toEqual({ bounded: true, overflowY: 'auto', scrollbarWidth: 'none' });
    expect(
      await thumbnailViewport.evaluate((element) => ({
        bounded: element.scrollHeight > element.clientHeight,
        overflowY: getComputedStyle(element).overflowY,
        scrollbarWidth: getComputedStyle(element).scrollbarWidth,
      })),
    ).toEqual({ bounded: true, overflowY: 'auto', scrollbarWidth: 'none' });
  } else {
    const gallery = page.locator('.gh-product-gallery');
    const main = gallery.locator('.gallery-main');
    const thumbnails = gallery.locator('.gallery-thumbnails');
    for (const width of [390, 320, 700]) {
      await page.setViewportSize({ width, height: 844 });
      const geometry = await gallery.evaluate((element) => {
        const main = element.querySelector('.gallery-main')!;
        const strip = element.querySelector('.gallery-thumbnails')!;
        const mainRect = main.getBoundingClientRect();
        const stripRect = strip.getBoundingClientRect();
        const heading = document
          .querySelector('.product-heading-row h1')!
          .getBoundingClientRect();
        const sku = document
          .querySelector('.product-heading-row .sku')!
          .getBoundingClientRect();
        return {
          mainWidth: mainRect.width,
          mainLeft: mainRect.left,
          stripWidth: stripRect.width,
          stripBelow: stripRect.top >= mainRect.bottom,
          stripOverflows: strip.scrollWidth > strip.clientWidth,
          horizontal: getComputedStyle(strip).overflowX,
          pageWidth: document.documentElement.scrollWidth,
          headingSameRow: sku.top < heading.bottom && sku.bottom > heading.top,
          skuOnRight: sku.left >= heading.right,
        };
      });
      expect(geometry).toEqual({
        mainWidth: width,
        mainLeft: 0,
        stripWidth: width,
        stripBelow: true,
        stripOverflows: true,
        horizontal: 'auto',
        pageWidth: width,
        headingSameRow: true,
        skuOnRight: true,
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await thumbnails
      .getByRole('button', { name: 'View image 4', exact: true })
      .click();
    await expect
      .poll(() =>
        main.evaluate((element) =>
          Math.round(element.scrollLeft / element.clientWidth),
        ),
      )
      .toBe(3);
    await expect(
      thumbnails.getByRole('button', { name: 'View image 4', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await main.evaluate((element) =>
      element.scrollTo({ left: element.clientWidth, behavior: 'instant' }),
    );
    await expect(
      thumbnails.getByRole('button', { name: 'View image 2', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page
      .getByRole('button', { name: 'Enlarge product image 2', exact: true })
      .click();
    await expect(page.getByRole('dialog').locator('img')).toHaveAttribute(
      'src',
      '/test-assets/lounge.jpg?detail=1',
    );
    await page.keyboard.press('Escape');
    await gallery.screenshot({
      path: 'test-results/gh-mobile-pdp-gallery.png',
    });
    await panel
      .locator('.product-heading-row')
      .screenshot({ path: 'test-results/gh-mobile-pdp-heading.png' });
  }
  await expect(panel.locator('select')).toHaveCount(0);
  await expect(panel.locator('del')).toHaveText('$179.00');
  await expect(panel.getByText('Special price', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('group', { name: /Choose Color:/ }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Choose size M', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Choose size M', exact: true }),
  ).toHaveCSS('background-color', 'rgb(66, 72, 81)');
  await expect(
    page.getByRole('button', { name: 'Choose Black', exact: true }),
  ).toHaveCSS('border-top-width', '3px');
  await expect(page.locator('.sku')).toHaveText('SKU: DRESS-BLACK-M');
  await expect(page.locator('.gallery-image img').first()).toHaveAttribute(
    'src',
    '/test-assets/chair.jpg',
  );
  const grey = page.getByRole('button', { name: 'Choose Grey', exact: true });
  const ivory = page.getByRole('button', {
    name: 'Choose Ivory',
    exact: true,
  });
  await expect(grey).toBeDisabled();
  await expect(ivory).toBeDisabled();
  await expect(grey).toHaveClass(/gh-option-unavailable/);
  expect(
    await grey.evaluate(
      (element) => getComputedStyle(element, '::after').content,
    ),
  ).not.toBe('none');
  await expect(
    page.getByRole('button', { name: 'Choose Black', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(add).toBeEnabled();
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(
    page.locator('.gh-purchase-row .quantity-selector output'),
  ).toHaveText('2');
  await expect(page.getByRole('status', { name: 'Product total' })).toHaveText(
    '$278.00',
  );
  await page
    .getByRole('button', { name: 'Enlarge product image 1', exact: true })
    .click();
  await expect(page.getByRole('dialog').locator('img')).toHaveAttribute(
    'src',
    '/test-assets/chair.jpg',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('#product-details')).toContainText(
    product.description,
  );
  await expect(page.locator('#product-details')).toContainText('Size + Fit');
  await screenshot(page, 'gh-options-pdp', info.project.name);
  await add.click();
  await expect
    .poll(() => addition)
    .toEqual({ productId: product.id, variantId: 2, quantity: 2 });
});

test('GH shell newsletter and footer work on home and PDP without subscribing remotely', async ({
  page,
}, info) => {
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') writes.push(request.url());
  });
  for (const path of ['/gh', `/gh/product/${products('gh')[0].id}`]) {
    await page.goto(path);
    const form = page.getByRole('form', { name: 'Garnet Hill email updates' });
    await expect(form).toBeVisible();
    await form.getByLabel('Your email').fill('preview@example.test');
    await form.getByRole('button', { name: 'Subscribe', exact: true }).click();
    await expect(
      page.locator('.gh-footer-connect [role="status"]'),
    ).toContainText('Thanks');
    const columns = page.locator('.footer-column');
    await expect(columns).toHaveCount(3);
    if (info.project.name !== 'desktop')
      await page
        .locator('.site-footer')
        .getByRole('button', { name: 'Customer Service', exact: true })
        .click();
    await expect(
      page
        .locator('.footer-links')
        .first()
        .getByRole('button', { name: 'Contact Us', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Legal' })).toContainText(
      'Privacy & Security',
    );
  }
  expect(writes).toEqual([]);
});

test('GH catalog and product pages keep their final layout while commerce data loads', async ({
  page,
}) => {
  let releaseCatalog!: () => void;
  const catalogReady = new Promise<void>((resolve) => {
    releaseCatalog = resolve;
  });
  await page.route('**/api/products?*', async (route) => {
    await catalogReady;
    const collection = products('gh');
    await route.fulfill({
      json: {
        products: collection,
        total: collection.length,
        offset: 0,
        limit: 24,
      },
    });
  });
  await page.goto('/gh/category/all-products');
  await expect(
    page.getByRole('status', { name: 'Loading products' }),
  ).toBeVisible();
  await expect(page.locator('.loading-card')).toHaveCount(6);
  releaseCatalog();
  await expect(page.locator('.shop-product-card')).toHaveCount(2);
  await page.unroute('**/api/products?*');

  let releaseProduct!: () => void;
  const productReady = new Promise<void>((resolve) => {
    releaseProduct = resolve;
  });
  const product = products('gh')[0];
  const productRoute = /\/api\/products\/[^?]+\?[^#]*$/;
  await page.route(productRoute, async (route) => {
    await productReady;
    await route.fulfill({ json: product });
  });
  await page.goto(`/gh/product/${product.id}`);
  await expect(
    page.getByRole('status', { name: 'Loading product details' }),
  ).toBeVisible();
  await expect(page.locator('.pdp-skeleton-image')).toBeVisible();
  await expect(page.locator('.pdp-skeleton-option')).toHaveCount(2);
  releaseProduct();
  await expect(
    page.getByRole('heading', { name: product.name, exact: true }),
  ).toBeVisible();
  await page.unroute(productRoute);
});

test('empty and failed stores never display static fallback products', async ({
  page,
}) => {
  await page.route('**/api/products?*', (route) =>
    route.fulfill({ json: { products: [], total: 0, offset: 0, limit: 24 } }),
  );
  await page.goto('/fg');
  await expect(
    page.getByRole('heading', { name: 'Our collection is on its way.' }),
  ).toBeVisible();
  await expect(page.locator('.shop-product-card')).toHaveCount(0);
  await page.route('**/api/products?*', (route) =>
    route.fulfill({ status: 503, json: { message: 'Store unavailable.' } }),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Store unavailable.');
  await expect(page.locator('.shop-product-card')).toHaveCount(0);
});

test('catalog loads every API page before searching and filtering', async ({
  page,
}) => {
  const first = products('fg')[0];
  const second = { ...products('fg')[1], name: 'Later Page Sofa' };
  const offsets: number[] = [];
  await page.route('**/api/products?*', (route) => {
    const offset = Number(
      new URL(route.request().url()).searchParams.get('offset') || 0,
    );
    offsets.push(offset);
    return route.fulfill({
      json: {
        products: [offset === 0 ? first : second],
        offset,
        limit: 1,
        total: 2,
      },
    });
  });
  await page.goto('/fg/category/all-products?q=Later');
  await expect(page.locator('.shop-product-card')).toHaveCount(1);
  await expect(page.locator('.shop-product-card')).toContainText(
    'Later Page Sofa',
  );
  expect(offsets).toContain(1);
});

test('brand switch during a pending add cannot open or replace the next Store bag', async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cart/items?*', async (route) => {
    await held;
    await route.fulfill({
      json: { quantity: 7, total: money(700), items: [] },
    });
  });
  await page.goto('/gr/product/' + id(2));
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  await expect(page.locator('.add-to-cart')).toBeDisabled();
  await page
    .getByRole('navigation', { name: 'Choose brand' })
    .getByRole('link', { name: 'Garnet Hill', exact: true })
    .click();
  await expect(page.locator('.brand-app')).toHaveAttribute('data-brand', 'gh');
  const response = page.waitForResponse((r) => r.request().method() === 'POST');
  release();
  await response;
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('link', {
      name: 'Open shopping bag, 0 items',
      exact: true,
    }),
  ).toBeVisible();
});

test('brand layouts fit narrow phones and both sides of the navigation and PDP breakpoints', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    'Explicit viewport sweep runs once',
  );
  test.setTimeout(120_000);
  for (const brand of ['fg', 'gr', 'gh'] as const) {
    await page.goto(
      `/${brand}/product/${id(brand === 'fg' ? 1 : brand === 'gr' ? 2 : 5)}`,
    );
    await expect(page.locator('.product-info-panel h1')).toBeVisible();
    const stackedAt = brand === 'gh' ? 900 : 700;
    for (const width of [320, 700, 701, 900, 901, 1023, 1024]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(
        page.locator('.product-info-panel .product-gallery'),
      ).toHaveCount(width <= 700 ? 1 : 0);
      const geometry = await page.evaluate(() => {
        const header = document
          .querySelector('.brand-header')!
          .getBoundingClientRect();
        const gallery = document
          .querySelector('.product-gallery')!
          .getBoundingClientRect();
        const info = document
          .querySelector('.product-info-panel')!
          .getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          header: header.width,
          gallery: {
            x: gallery.x,
            y: gallery.y,
            right: gallery.right,
            bottom: gallery.bottom,
          },
          info: { x: info.x, y: info.y, right: info.right },
          width: innerWidth,
        };
      });
      expect(geometry.overflow, `${brand} at ${width}px`).toBeLessThanOrEqual(
        1,
      );
      expect(
        geometry.info.right,
        `${brand} purchase controls at ${width}px`,
      ).toBeLessThanOrEqual(width + 1);
      if (width <= 700)
        expect(geometry.info.y).toBeLessThan(geometry.gallery.y);
      else if (width <= stackedAt)
        expect(geometry.info.y).toBeGreaterThanOrEqual(geometry.gallery.bottom);
      else
        expect(geometry.info.x).toBeGreaterThanOrEqual(geometry.gallery.right);
    }
  }
});

test('a stale cart read cannot overwrite a completed add', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cart?*', async (route) => {
    await held;
    await route.fulfill({ json: null });
  });
  await page.goto('/gr/product/' + id(2));
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'In Your Bag (1)' }),
  ).toBeVisible();
  const response = page.waitForResponse(
    (r) => new URL(r.url()).pathname === '/api/cart',
  );
  release();
  await response;
  await expect(
    page.getByRole('heading', { name: 'In Your Bag (1)' }),
  ).toBeVisible();
});

test('cart conflict refreshes server state without replaying the add', async ({
  page,
}) => {
  let writes = 0;
  await page.route('**/api/cart/items?*', (route) => {
    writes++;
    return route.fulfill({
      status: 409,
      json: { message: 'Your cart changed in another tab. Please try again.' },
    });
  });
  await page.goto('/gr/product/' + id(2));
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('changed in another tab');
  await expect(
    page.getByRole('button', { name: 'ADD TO CART', exact: true }),
  ).toBeEnabled();
  expect(writes).toBe(1);
});

test('product links use canonical slugs and support refresh and history', async ({
  page,
}) => {
  await page.goto('/fg/category/all-products');
  await page.locator('.card-content a').first().click();
  await expect(page).toHaveURL(/\/fg\/product\/fg-product-/);
  await expect(page.locator('.product-info-panel h1')).toHaveText(
    'FG Connected Chair',
  );
  await page.reload();
  await expect(page.locator('.product-info-panel h1')).toHaveText(
    'FG Connected Chair',
  );
  await page.goBack();
  await expect(page).toHaveURL(/\/fg\/category\/all-products/);
  await expect(page.locator('.shop-product-card')).toHaveCount(2);
});

test('decoded category slugs select the matching collection', async ({
  page,
}) => {
  const collection = products('fg').map((product) => ({
    ...product,
    categories: [{ id: 'bed-bath', slug: 'bed & bath', name: 'Bed & Bath' }],
  }));
  await page.route('**/api/products?*', (route) =>
    route.fulfill({
      json: {
        products: collection,
        total: collection.length,
        offset: 0,
        limit: 24,
      },
    }),
  );
  await page.goto('/fg/category/bed%20%26%20bath');
  await expect(page.locator('.category-intro h1')).toHaveText('Bed & Bath');
  await expect(page.locator('.shop-product-card')).toHaveCount(2);
});

test('GH small screen filter and sort preserves the desktop controls', async ({
  page,
}, info) => {
  const collection = products('gh').map((product, index) => ({
    ...product,
    catalogSort: {
      createdAt: index ? '2026-02-01T00:00:00Z' : '2025-01-01T00:00:00Z',
      rating: index ? 5 : 3,
      reviewCount: index ? 10 : 2,
    },
    variants: product.variants.map((variant) => ({
      ...variant,
      attributes: [
        { name: 'size', value: index ? 'Large' : 'Small' },
        { name: 'color', value: index ? 'Blue' : 'Red' },
        { name: 'material', value: index ? 'Linen' : 'Cotton' },
      ],
    })),
  }));
  await page.route('**/api/products?**', (route) =>
    route.fulfill({
      json: { products: collection, total: 2, offset: 0, limit: 24 },
    }),
  );
  await page.goto('/gh/category/all-products');
  await expect(page.locator('.shop-product-card')).toHaveCount(2);
  const trigger = page.getByRole('button', {
    name: 'Filter & Sort',
    exact: true,
  });
  if (info.project.name !== 'mobile') {
    await expect(trigger).toBeHidden();
    await expect(page.locator('.filters')).toBeVisible();
    await expect(page.getByLabel('Sort by')).toBeVisible();
    await expect(page.locator('.catalog-page-status')).toContainText(
      'Page 1 of 1',
    );
    await page.getByLabel('Sort by').selectOption('high');
    await expect(page.locator('.shop-product-card').first()).toContainText(
      'Connected Sofa',
    );
    return;
  }
  await expect(page.locator('.filters')).toBeHidden();
  await expect(page.getByLabel('Sort by')).toBeHidden();
  await expect(page.locator('.catalog-item-count')).toHaveText('2 Items');
  await screenshot(page, 'gh-mobile-filter-listing', info.project.name);
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Filter & Sort' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('details[open]')).toHaveCount(0);
  await expect(
    dialog.getByRole('radio', { name: 'Featured', exact: true }),
  ).toBeChecked();
  await screenshot(page, 'gh-mobile-filter-dialog', info.project.name);
  for (const name of ['New Arrival', 'Top Rated', 'Rating: High to Low']) {
    await dialog.getByRole('radio', { name, exact: true }).check();
    await expect(page.locator('.shop-product-card').first()).toContainText(
      'Connected Sofa',
    );
  }
  await dialog
    .getByRole('radio', { name: 'Price: Low to High', exact: true })
    .check();
  await expect(page.locator('.shop-product-card').first()).toContainText(
    'Connected Chair',
  );
  await dialog
    .locator('summary')
    .filter({ hasText: /^Category$/ })
    .click();
  await dialog.getByLabel('Chairs', { exact: true }).check();
  await expect(
    dialog.getByRole('button', { name: 'View 1 Items' }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'View 1 Items' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator('.shop-product-card')).toHaveCount(1);
  await trigger.click();
  await dialog
    .locator('summary')
    .filter({ hasText: /^Category$/ })
    .click();
  await expect(dialog.getByLabel('Chairs', { exact: true })).toBeChecked();
  await dialog.getByRole('button', { name: 'Clear All', exact: true }).click();
  await expect(
    dialog.getByRole('radio', { name: 'Featured', exact: true }),
  ).toBeChecked();
  for (const [facet, choice] of [
    ['Size', 'Small (1)'],
    ['Color', 'Red (1)'],
    ['Material', 'Cotton (1)'],
  ]) {
    await dialog
      .locator('summary')
      .filter({ hasText: new RegExp(`^${facet}$`) })
      .click();
    await dialog.getByLabel(choice, { exact: true }).check();
  }
  await expect(
    dialog.getByRole('button', { name: 'View 1 Items' }),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Clear All', exact: true }).click();
  await dialog
    .locator('summary')
    .filter({ hasText: /^Price$/ })
    .click();
  await dialog
    .getByRole('radio', { name: '$500 and over', exact: true })
    .check();
  await expect(
    dialog.getByRole('button', { name: 'View 1 Items' }),
  ).toBeVisible();
  await expect(page.locator('.shop-product-card').first()).toContainText(
    'Connected Sofa',
  );
  await dialog.getByRole('button', { name: 'Clear All', exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: 'View 2 Items' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await trigger.click();
  await dialog.getByRole('button', { name: 'Close filter and sort' }).click();
  await expect(dialog).toHaveCount(0);
  await trigger.click();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.filters')).toBeVisible();
  await expect(page.getByLabel('Sort by')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    'hidden',
  );
});

test('GR and FG mobile filter overlay matches the compact catalog controls', async ({
  page,
}, info) => {
  for (const brand of ['gr', 'fg'] as const) {
    const collection = products(brand).map((product, index) => ({
      ...product,
      catalogSort: {
        createdAt: index ? '2026-09-01T00:00:00Z' : '2025-01-01T00:00:00Z',
        rating: index ? 5 : 3,
      },
      variants: product.variants.map((variant) => ({
        ...variant,
        available: index === 0,
      })),
    }));
    await page.route('**/api/products?**', (route) =>
      route.fulfill({
        json: { products: collection, total: 2, offset: 0, limit: 24 },
      }),
    );
    await page.goto(`/${brand}/category/all-products`);
    await expect(page.locator('.shop-product-card')).toHaveCount(2);
    const trigger = page.getByRole('button', {
      name: 'Filter & Sort',
      exact: true,
    });
    if (info.project.name !== 'mobile') {
      await expect(trigger).toBeHidden();
      await expect(page.locator('.filters')).toBeVisible();
      await expect(page.getByLabel('Sort by')).toBeVisible();
      continue;
    }
    await expect(page.locator('.filters')).toBeHidden();
    await expect(page.getByLabel('Sort by')).toBeHidden();
    await expect(page.locator('.compact-mobile-filter-status')).toContainText(
      '2 Items',
    );
    await page.screenshot({
      path: `test-results/${brand}-compact-filters-listing.png`,
    });
    await page.getByRole('switch', { name: 'In-Stock' }).check();
    await expect(page.locator('.compact-mobile-filter-status')).toContainText(
      '1 Items',
    );
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Filter & Sort' });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('switch', { name: 'In-Stock' }),
    ).toBeChecked();
    await expect(dialog.locator('details[open]')).toHaveCount(0);
    await dialog.getByRole('switch', { name: 'In-Stock' }).uncheck();
    await expect(
      dialog.getByRole('button', { name: 'View 2 ITEMS', exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `test-results/${brand}-compact-filters-dialog.png`,
    });
    for (const name of ['Price:(High to Low)', 'Customer Ratings', 'Newest']) {
      await dialog.getByRole('radio', { name, exact: true }).check();
      await expect(page.locator('.shop-product-card').first()).toContainText(
        'Connected Sofa',
      );
    }
    await dialog
      .getByRole('radio', { name: 'Price:(Low to High)', exact: true })
      .check();
    await expect(page.locator('.shop-product-card').first()).toContainText(
      'Connected Chair',
    );
    await dialog
      .locator('summary')
      .filter({ hasText: /^Type$/ })
      .click();
    await dialog.getByLabel('Chairs', { exact: true }).check();
    await dialog
      .getByRole('button', { name: 'View 1 ITEMS', exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator('.shop-product-card')).toHaveCount(1);
    await trigger.click();
    await dialog
      .getByRole('button', { name: 'Clear All', exact: true })
      .click();
    await expect(
      dialog.getByRole('radio', { name: 'Recommended', exact: true }),
    ).toBeChecked();
    await dialog
      .locator('summary')
      .filter({ hasText: /^Price$/ })
      .click();
    if (brand === 'gr')
      await dialog.getByRole('slider', { name: 'Minimum price' }).fill('600');
    else
      await dialog
        .getByRole('radio', { name: '$500 and over', exact: true })
        .check();
    await expect(
      dialog.getByRole('button', { name: 'View 1 ITEMS', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.shop-product-card').first()).toContainText(
      'Connected Sofa',
    );
    await dialog
      .getByRole('button', { name: 'Clear All', exact: true })
      .click();
    await expect(
      dialog.getByRole('button', { name: 'View 2 ITEMS', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      'hidden',
    );
    await trigger.click();
    await dialog.getByRole('button', { name: 'Close filter and sort' }).click();
    await trigger.click();
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(
      dialog.getByRole('button', { name: 'View 2 ITEMS' }),
    ).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
    await page.setViewportSize({ width: 1000, height: 900 });
    await expect(dialog).toHaveCount(0);
    await expect(page.getByLabel('Sort by')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
  }
});

test('FG mini cart keeps Frontgate colors and supports header navigation with items', async ({
  page,
}, info) => {
  await page.goto(`/fg/product/${products('fg')[0].id}`);
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  const cart = page.getByRole('dialog', { name: 'In Your Bag (1)' });
  await expect(cart).toContainText('FG Connected Chair');
  await expect(
    cart.getByRole('link', { name: 'View Bag', exact: true }),
  ).toHaveCSS('background-color', 'rgb(37, 37, 37)');
  await page.keyboard.press('Escape');
  const icon = page.getByRole('link', { name: 'Open shopping bag, 1 items' });
  if (info.project.name === 'desktop') {
    await icon.hover();
    await expect(cart).toBeVisible();
    await expect(cart).toHaveAttribute('popover', 'auto');
    await expect(cart).toContainText('FG Connected Chair');
    await cart.screenshot({ path: 'test-results/fg-mini-cart-preview.png' });
    await icon.click();
  } else await icon.tap();
  await expect(page).toHaveURL(/\/fg\/cart$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.bag-item')).toContainText('FG Connected Chair');
});

test('FG follows GR layout geometry while retaining Frontgate branding and controls', async ({
  page,
}, info) => {
  const layouts: Record<string, unknown> = {};
  for (const brand of ['gr', 'fg'] as const) {
    await page.goto(`/${brand}`);
    await expect(page.locator('.shop-product-card')).toHaveCount(2);
    const home = await page.evaluate(() => {
      const header = getComputedStyle(document.querySelector('.brand-header')!);
      const hero = getComputedStyle(document.querySelector('.home-hero')!);
      const copy = document
        .querySelector('.hero-copy')!
        .getBoundingClientRect();
      const photo = document
        .querySelector('.hero-photograph')!
        .getBoundingClientRect();
      return {
        headerColumns: header.gridTemplateColumns,
        headerGap: header.gap,
        headerPadding: header.padding,
        heroHeight: innerWidth > 800 ? hero.height : 'auto',
        copyOnLeft: copy.left < photo.left,
        copyBelowPhoto: copy.top >= photo.bottom,
      };
    });
    if (brand === 'fg') {
      await expect(page.locator('.hero-copy h1')).toContainText(
        'extraordinary',
      );
      await expect(
        page.getByRole('banner').getByRole('link', { name: 'Frontgate home' }),
      ).toBeVisible();
      await expect(page.locator('.brand-app')).toHaveAttribute(
        'data-brand',
        'fg',
      );
      await expect(page.locator('.brand-app')).toHaveCSS(
        'font-family',
        'Arial, Helvetica, sans-serif',
      );
      await expect(page.locator('.brand-app')).toHaveCSS(
        'color',
        'rgb(37, 37, 37)',
      );
      await expect(
        page.locator('.production-navigation').first(),
      ).toContainText('TABLETOP & ENTERTAINING');
      await expect(page.locator('.production-subnavigation')).toHaveCount(0);
      await screenshot(page, 'fg-gr-layout-home', info.project.name);
    }
    await page.goto(`/${brand}/category/all-products`);
    await expect(page.locator('.shop-product-card')).toHaveCount(2);
    const catalog = await page.evaluate(() => {
      const container = getComputedStyle(
        document.querySelector('.category-page')!,
      );
      const layout = getComputedStyle(
        document.querySelector('.catalog-layout')!,
      );
      const grid = getComputedStyle(
        document.querySelector('.catalog-results .shop-grid')!,
      );
      const content = getComputedStyle(
        document.querySelector('.catalog-results .card-content')!,
      );
      return {
        width: container.width,
        padding: container.padding,
        columns: layout.gridTemplateColumns,
        gap: layout.gap,
        productColumns: grid.gridTemplateColumns,
        productGap: grid.gap,
        alignment: content.textAlign,
      };
    });
    if (brand === 'fg') {
      await expect(page.locator('.shop-product-card').first()).toContainText(
        'FG Connected Chair',
      );
      await expect(page.locator('.filters')).toContainText('All prices');
      await expect(page.locator('.gr-stock-filter')).toHaveCount(0);
      await expect(
        page.locator('.catalog-toolbar select option').first(),
      ).toHaveText('Featured');
      await screenshot(page, 'fg-gr-layout-catalog', info.project.name);
    }
    await page.goto(`/${brand}/product/${products(brand)[0].id}`);
    await expect(page.locator('.product-info-panel h1')).toBeVisible();
    const pdp = await page.evaluate(() => {
      const container = getComputedStyle(document.querySelector('.pdp-page')!);
      const layout = getComputedStyle(document.querySelector('.pdp-layout')!);
      const gallery = getComputedStyle(
        document.querySelector('.product-gallery')!,
      );
      const thumbnails = getComputedStyle(
        document.querySelector('.gallery-thumbnails')!,
      );
      const thumbnail = document
        .querySelector('.gallery-thumbnails button')!
        .getBoundingClientRect();
      return {
        width: container.width,
        padding: container.padding,
        columns: layout.gridTemplateColumns,
        gap: layout.gap,
        galleryColumns: gallery.gridTemplateColumns,
        galleryGap: gallery.gap,
        thumbnailsDirection: thumbnails.flexDirection,
        thumbnailsGap: thumbnails.gap,
        thumbnailsPadding: thumbnails.padding,
        thumbnailWidth: thumbnail.width,
        thumbnailHeight: thumbnail.height,
      };
    });
    if (brand === 'fg') {
      await expect(page.locator('.tile-options')).toBeVisible();
      await expect(page.locator('.color-option-panel')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'ADD TO CART', exact: true }),
      ).toHaveCSS('background-color', 'rgb(37, 37, 37)');
      await expect(page.locator('.product-heading-row h1')).toHaveCSS(
        'font-family',
        'Arial, Helvetica, sans-serif',
      );
      await expect(page.locator('.product-heading-row h1')).toHaveText(
        'FG Connected Chair',
      );
      await expect(page.locator('.sku')).toContainText('CHAIR-IVORY');
      await screenshot(page, 'fg-gr-layout-pdp', info.project.name);
    }
    layouts[brand] = { home, catalog, pdp };
  }
  expect(layouts.fg).toEqual(layouts.gr);
});

test('legacy demo remains isolated from storefront brands', async ({
  page,
}) => {
  await page.route('**/api/**', (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('store') !== 'b2c-retail-store')
      return route.fallback();
    return route.fulfill({
      json:
        url.pathname === '/api/cart'
          ? null
          : { products: [], total: 0, offset: 0, limit: 24 },
    });
  });
  await page.goto('/?store=b2c-retail-store');
  await expect(
    page.getByRole('combobox', { name: 'Store', exact: true }),
  ).toHaveValue('b2c-retail-store');
  await expect(page.locator('.store-switcher option')).toHaveCount(2);
  await page.goto('/fg');
  await expect(page.locator('.brand-app')).toHaveAttribute('data-brand', 'fg');
  await expect(page.locator('.shop-product-card')).toHaveCount(2);
});
