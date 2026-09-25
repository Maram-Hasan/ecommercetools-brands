import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';

Object.assign(process.env, {
  CTP_PROJECT_KEY: 'test-project',
  CTP_CLIENT_ID: 'fake-client',
  CTP_CLIENT_SECRET: 'fake-secret',
  CTP_AUTH_URL: 'https://auth.example.com',
  CTP_API_URL: 'https://api.example.com',
  CTP_SCOPES:
    'view_published_products:test-project view_stores:test-project view_product_selections:test-project',
  CTP_CURRENCY: 'USD',
  CTP_COUNTRY: 'US',
  CTP_LOCALE: 'en-US',
  CTP_DEBUG_PRODUCTS: 'false',
});

// Exercise the real SDK request builders with a fake HTTP transport. No live
// Project reads or writes are performed by these regression tests.
const originalFetch = globalThis.fetch;
const requests: URL[] = [];
let respond: (url: URL) => Response;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
globalThis.fetch = async (input) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname === 'auth.example.com')
    return json({
      access_token: 'fake-token',
      token_type: 'Bearer',
      expires_in: 3600,
    });
  requests.push(url);
  return respond(url);
};
const { commerce } = await import('../server/commercetools/service.js');
after(() => {
  globalThis.fetch = originalFetch;
});
beforeEach(() => {
  requests.length = 0;
  respond = (url) => {
    throw new Error(`Unexpected request: ${url.pathname}`);
  };
});

const storeKey = 'fixture-store';
const storePath = `/test-project/stores/key=${storeKey}`;
const scopedPath = `/test-project/in-store/key=${storeKey}`;
const assignmentsPath = `${scopedPath}/product-selection-assignments`;
const projectionPath = `${scopedPath}/product-projections/`;
const id = (index: number) =>
  `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
const assignment = (index: number) => ({
  product: { typeId: 'product', id: id(index) },
  productSelection: { typeId: 'product-selection', id: 'selection' },
});
const store = (
  selections: unknown[] = [
    {
      active: true,
      productSelection: { id: 'selection', obj: { mode: 'Individual' } },
    },
  ],
) => ({
  key: storeKey,
  distributionChannels: [{ id: 'fixture-channel' }],
  supplyChannels: [],
  productSelections: selections,
});
const product = (productId: string) => ({
  id: productId,
  key: `key-${productId}`,
  name: { 'en-US': 'Fixture product' },
  description: {},
  masterVariant: {
    id: 1,
    sku: `fixture-${productId}`,
    images: [],
    price: {
      value: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 1200,
        fractionDigits: 2,
      },
    },
  },
  variants: [],
});

test('active assignments drive Store-scoped requests and preserve the UI response contract', async () => {
  respond = (url) => {
    if (url.pathname === storePath) return json(store());
    if (url.pathname === assignmentsPath)
      return json({
        results: [assignment(2), assignment(1), assignment(1)],
        total: 3,
      });
    if (url.pathname.startsWith(projectionPath)) {
      assert.equal(url.searchParams.get('staged'), 'false');
      assert.equal(url.searchParams.get('priceCurrency'), 'USD');
      assert.equal(url.searchParams.get('priceCountry'), 'US');
      assert.equal(url.searchParams.get('priceChannel'), 'fixture-channel');
      return json(product(url.pathname.slice(projectionPath.length)));
    }
    throw new Error(
      `Unexpected project-level catalog request: ${url.pathname}`,
    );
  };
  const result = await commerce.products(0, storeKey);
  assert.equal(result.total, 2);
  assert.equal(result.limit, 24);
  assert.deepEqual(
    result.products.map((item) => item.id),
    [id(1), id(2)],
  );
  assert.equal(result.products[0].variants[0].sku, `fixture-${id(1)}`);
  assert.equal(result.products[0].variants[0].price?.amount, 1200);
  assert.equal(
    requests.filter((url) => url.pathname.startsWith(projectionPath)).length,
    2,
  );
  assert.equal(
    requests.some(
      (url) => url.pathname === '/test-project/product-projections',
    ),
    false,
  );
});

test('all assignment pages are read; duplicate and unpublished products do not break catalog totals or paging', async () => {
  respond = (url) => {
    if (url.pathname === storePath) return json(store());
    if (url.pathname === assignmentsPath) {
      const offset = Number(url.searchParams.get('offset'));
      assert.equal(url.searchParams.get('withTotal'), 'true');
      const results =
        offset === 0
          ? Array.from({ length: 500 }, (_, index) =>
              assignment((index % 26) + 1),
            )
          : [assignment(27)];
      return json({ results, total: 501 });
    }
    if (url.pathname.startsWith(projectionPath)) {
      const productId = url.pathname.slice(projectionPath.length);
      return productId === id(1)
        ? json(
            { message: 'Unpublished', errors: [{ code: 'ResourceNotFound' }] },
            404,
          )
        : json(product(productId));
    }
    throw new Error(`Unexpected request: ${url.pathname}`);
  };
  const result = await commerce.products(24, storeKey);
  assert.equal(result.total, 26);
  assert.equal(result.offset, 24);
  assert.deepEqual(
    result.products.map((item) => item.id),
    [id(26), id(27)],
  );
  assert.deepEqual(
    requests
      .filter((url) => url.pathname === assignmentsPath)
      .map((url) => url.searchParams.get('offset')),
    ['0', '500'],
  );
});

test('an inactive Inclusion selection returns an empty catalog without a project-wide fallback', async () => {
  respond = (url) => {
    if (url.pathname === storePath)
      return json(
        store([
          { active: false, productSelection: { obj: { mode: 'Individual' } } },
        ]),
      );
    if (url.pathname === assignmentsPath)
      return json({ results: [], total: 0 });
    throw new Error(
      'An empty Store must not fall back to the Project catalog.',
    );
  };
  assert.deepEqual(await commerce.products(0, storeKey), {
    products: [],
    total: 0,
    offset: 0,
    limit: 24,
  });
});

test('Store projection errors other than unavailable products are propagated', async () => {
  respond = (url) => {
    if (url.pathname === storePath) return json(store());
    if (url.pathname === assignmentsPath)
      return json({ results: [assignment(1)], total: 1 });
    return json(
      { message: 'Access denied', errors: [{ code: 'Forbidden' }] },
      403,
    );
  };
  await assert.rejects(
    commerce.products(0, storeKey),
    (error: { statusCode?: number }) => error.statusCode === 403,
  );
});

test('Store-returned variant selection is preserved without restoring excluded variants', async () => {
  respond = (url) => {
    if (url.pathname === storePath) return json(store());
    if (url.pathname === assignmentsPath)
      return json({ results: [assignment(1)], total: 1 });
    const projection = product(id(1));
    return json({
      ...projection,
      masterVariant: {
        ...projection.masterVariant,
        id: 3,
        sku: 'selected-variant',
      },
    });
  };
  const result = await commerce.products(0, storeKey);
  assert.deepEqual(
    result.products[0].variants.map((variant) => variant.id),
    [3],
  );
});

test('a Store without selections retains its complete-catalog behavior', async () => {
  respond = (url) => {
    if (url.pathname === storePath) return json(store([]));
    assert.equal(url.pathname, '/test-project/product-projections');
    assert.equal(url.searchParams.get('storeProjection'), storeKey);
    return json({
      results: [product(id(1))],
      total: 117,
      count: 1,
      limit: 24,
      offset: 0,
    });
  };
  const result = await commerce.products(0, storeKey);
  assert.equal(result.total, 117);
  assert.equal(result.products.length, 1);
});

test('slug lookup pages only the requested Store catalog and reports missing products', async (context) => {
  const pages: number[] = [];
  context.mock.method(
    commerce,
    'products',
    async (offset: number, key: string) => {
      assert.equal(key, 'grandin-road');
      pages.push(offset);
      return {
        products: [
          {
            id: id(offset + 1),
            slug: offset ? 'wanted' : 'other',
            name: 'Chair',
            description: '',
            variants: [],
          },
        ],
        total: 2,
        limit: 1,
        offset,
      };
    },
  );
  assert.equal(
    (await commerce.productBySlug('wanted', 'grandin-road')).id,
    id(2),
  );
  assert.deepEqual(pages, [0, 1]);
  await assert.rejects(commerce.productBySlug('absent', 'grandin-road'), {
    statusCode: 404,
  });
});
