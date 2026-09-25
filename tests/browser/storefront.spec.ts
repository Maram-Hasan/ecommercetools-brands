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
    const addButton = brand === 'gh' ? 'ADD TO BAG' : 'ADD TO CART';
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
    if (info.project.name === 'mobile')
      await page.getByRole('button', { name: 'Filters +' }).click();
    await page.getByLabel('Chairs', { exact: true }).check();
    await expect(page.locator('.shop-product-card')).toHaveCount(1);
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();
    await page.getByLabel('Sort by').selectOption('high');
    await expect(page.locator('.shop-product-card').first()).toContainText(
      'Connected Sofa',
    );
    await screenshot(page, brand + '-category', info.project.name);
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
    await page
      .getByRole('button', { name: 'Choose Unpriced', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: addButton, exact: true }),
    ).toBeDisabled();
    await page
      .getByRole('button', { name: 'Choose Walnut', exact: true })
      .click();
    await expect(page.locator('.product-info-panel .shop-price')).toContainText(
      '$399.00',
    );
    await screenshot(page, brand + '-pdp', info.project.name);
    await page.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(
      page.getByRole('status', { name: 'Product total' }),
    ).toHaveText('$798.00');
    await page.getByRole('button', { name: addButton, exact: true }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Your Bag (2)' }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('CHAIR-WALNUT');
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
  await page
    .getByRole('button', { name: 'Open shopping bag, 0 items' })
    .click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Your Bag (0)' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/fg/cart');
  await page
    .getByRole('navigation', { name: 'Choose brand' })
    .getByRole('link', { name: 'Garnet Hill' })
    .click();
  await expect(page.locator('.shop-product-card').first()).toContainText(
    'GH Connected Chair',
  );
  await expect(
    page.getByRole('button', { name: 'Open shopping bag, 0 items' }),
  ).toBeVisible();
  await page.goto('/gh/product/' + id(5));
  await page.getByRole('button', { name: 'ADD TO BAG', exact: true }).click();
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
  if (await page.getByRole('button', { name: 'Filters +' }).isVisible())
    await page.getByRole('button', { name: 'Filters +' }).click();
  await page.getByLabel('Chairs', { exact: true }).check();
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
  await expect(page.locator('.gallery-image img')).toHaveAttribute(
    'src',
    '/test-assets/lounge.jpg?detail=1',
  );
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
  await expect(page.locator('.gallery-image img')).toHaveAttribute(
    'src',
    '/test-assets/chair.jpg',
  );
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
    expect(details!.y).toBeGreaterThan(gallery!.y + gallery!.height);
  else expect(details!.x).toBeGreaterThan(gallery!.x);
  await page.getByRole('button', { name: 'ADD TO CART', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('159041 GREEN');
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
        images: ['/test-assets/lounge.jpg'],
        price: money(4900),
        available: true,
        attributes: [{ name: 'size', value: '3 x 5' }],
      },
      {
        id: 2,
        sku: 'PAD-LARGE',
        images: ['/test-assets/chair.jpg'],
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
  await expect(page.locator('.gallery-image img')).toHaveAttribute(
    'src',
    '/test-assets/chair.jpg',
  );
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
    expect(details!.y).toBeGreaterThan(gallery!.y + gallery!.height);
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
    page.getByRole('heading', { name: 'Your Bag (1)' }),
  ).toBeVisible();
  const response = page.waitForResponse(
    (r) => new URL(r.url()).pathname === '/api/cart',
  );
  release();
  await response;
  await expect(
    page.getByRole('heading', { name: 'Your Bag (1)' }),
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

test('legacy demo remains isolated from storefront brands', async ({ page }) => {
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
