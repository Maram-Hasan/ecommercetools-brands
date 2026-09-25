import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import type { Server } from 'node:http';
import type { Cart, CartUpdateAction } from '@commercetools/platform-sdk';

// Unit tests use fake configuration and mocked SDK operations, never the real project.
Object.assign(process.env, {
  CTP_PROJECT_KEY: 'test-project',
  CTP_CLIENT_ID: 'test-client',
  CTP_CLIENT_SECRET: 'test-secret',
  CTP_API_URL: 'https://api.example.com',
  CTP_AUTH_URL: 'https://auth.example.com',
  CTP_SCOPES: 'view_published_products:test-project manage_orders:test-project',
  CTP_CURRENCY: 'USD',
  CTP_COUNTRY: '',
  CTP_LOCALE: 'en-US',
});
const { createApiRouter, apiErrorHandler } = await import('../server/api.js');
const { commerce } = await import('../server/commercetools/service.js');
let server: Server;
let base: string;
before(async () => {
  const app = express();
  app.use('/api', express.json(), createApiRouter(), apiErrorHandler);
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  base = `http://127.0.0.1:${address.port}/api`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

const productId = '11111111-1111-4111-8111-111111111111';
const cartId = '22222222-2222-4222-8222-222222222222';
const itemId = '33333333-3333-4333-8333-333333333333';

test('FG, GR and GH Store keys from shared storefronts reach commerce', async (context) => {
  const requested: string[] = [];
  context.mock.method(commerce, 'products', async (_offset: number, storeKey: string) => { requested.push(storeKey); return { products: [], total: 0, offset: 0, limit: 24 }; });
  for (const key of ['frontgate', 'grandin-road', 'garnethill']) {
    const response = await fetch(`${base}/products?store=${key}`);
    assert.equal(response.status, 200);
  }
  assert.deepEqual(requested, ['frontgate', 'grandin-road', 'garnethill']);
});
const money = (amount: number) => ({
  type: 'centPrecision' as const,
  currencyCode: 'USD',
  centAmount: amount,
  fractionDigits: 2,
});

test('unknown and repeated Store keys are rejected before any commerce request', async (context) => {
  const query = context.mock.method(commerce, 'products', async () => {
    throw new Error('Unexpected SDK request');
  });
  for (const key of [
    'unknown',
    '__proto__',
    'b2c-retail-store&store=second_store_explore',
  ]) {
    const response = await fetch(`${base}/products?store=${key}`);
    assert.equal(response.status, 400);
  }
  assert.equal(query.mock.callCount(), 0);
});

test('product list and details carry the selected Store to the SDK service', async (context) => {
  const storeKey = 'second_store_explore';
  context.mock.method(
    commerce,
    'products',
    async (offset: number, key: string) => {
      assert.equal(offset, 24);
      assert.equal(key, storeKey);
      return { products: [], total: 0, offset, limit: 24 };
    },
  );
  context.mock.method(commerce, 'product', async (id: string, key: string) => {
    assert.equal(id, productId);
    assert.equal(key, storeKey);
    return { id, name: 'Store product', description: '', variants: [] };
  });
  assert.equal(
    (await fetch(`${base}/products?offset=24&store=${storeKey}`)).status,
    200,
  );
  assert.equal(
    (await fetch(`${base}/products/${productId}?store=${storeKey}`)).status,
    200,
  );
});

test('Store cart cookies are independent and a copied foreign cart cannot be updated', async (context) => {
  const first = 'b2c-retail-store';
  const second = 'second_store_explore';
  const lookup = context.mock.method(
    commerce,
    'cart',
    async (_id: string, key: string) => {
      assert.equal(key, second);
      return {
        id: cartId,
        store: { typeId: 'store', key: first },
        cartState: 'Active',
        totalPrice: money(0),
        lineItems: [],
      } as unknown as Cart;
    },
  );
  const update = context.mock.method(commerce, 'updateCart', async () => {
    throw new Error('Unexpected write');
  });
  const otherCookie = await fetch(`${base}/cart?store=${second}`, {
    headers: { Cookie: `storefront_cart_${first}=${cartId}` },
  });
  assert.equal(await otherCookie.json(), null);
  assert.equal(lookup.mock.callCount(), 0);
  const copiedCookie = { Cookie: `storefront_cart_${second}=${cartId}` };
  const response = await fetch(`${base}/cart?store=${second}`, {
    headers: copiedCookie,
  });
  assert.equal(await response.json(), null);
  assert.match(
    response.headers.get('set-cookie')!,
    /Expires=Thu, 01 Jan 1970/i,
  );
  const mutation = await fetch(`${base}/cart/items/${itemId}?store=${second}`, {
    method: 'PATCH',
    headers: { ...copiedCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: 2 }),
  });
  assert.equal(mutation.status, 404);
  assert.equal(update.mock.callCount(), 0);
});

test('an unavailable Store variant cannot create a cart', async (context) => {
  context.mock.method(commerce, 'product', async () => ({
    id: productId,
    name: 'Unpriced',
    description: '',
    variants: [{ id: 1, images: [], price: null }],
  }));
  const create = context.mock.method(commerce, 'createCart', async () => {
    throw new Error('Unexpected write');
  });
  const response = await fetch(
    `${base}/cart/items?store=second_store_explore`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId: 1, quantity: 1 }),
    },
  );
  assert.equal(response.status, 400);
  assert.equal(create.mock.callCount(), 0);
});

test('invalid IDs, pagination, quantities, and malformed JSON are rejected before SDK writes', async (context) => {
  const create = context.mock.method(commerce, 'createCart', async () => {
    throw new Error('Unexpected write');
  });
  for (const path of [
    '/products/not-an-id',
    '/products?offset=-1',
    '/products?offset=1.5',
  ]) {
    assert.equal((await fetch(base + path)).status, 400);
  }
  for (const quantity of [-1, 0, 1.5, 100, '2']) {
    const response = await fetch(`${base}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, variantId: 1, quantity }),
    });
    assert.equal(response.status, 400);
  }
  const malformed = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.equal(create.mock.callCount(), 0);
});

test('cart creation, cookie persistence, versioned quantity updates, and removal', async (context) => {
  const storeKey = 'b2c-retail-store';
  context.mock.method(commerce, 'product', async (_id: string, key: string) => {
    assert.equal(key, storeKey);
    return {
      id: productId,
      name: 'Cup',
      description: '',
      variants: [
        {
          id: 1,
          images: [],
          price: { amount: 1200, fractionDigits: 2, currencyCode: 'USD' },
        },
      ],
    };
  });
  let cart = {
    id: cartId,
    version: 1,
    cartState: 'Active',
    store: { typeId: 'store', key: storeKey },
    lineItems: [],
    totalPrice: money(0),
  } as unknown as Cart;
  context.mock.method(commerce, 'createCart', async (key: string) => {
    assert.equal(key, storeKey);
    return cart;
  });
  context.mock.method(commerce, 'cart', async (id: string, key: string) => {
    assert.equal(key, storeKey);
    assert.equal(id, cartId);
    return cart;
  });
  context.mock.method(
    commerce,
    'updateCart',
    async (
      id: string,
      version: number,
      action: CartUpdateAction,
      key: string,
    ) => {
      assert.equal(key, storeKey);
      assert.equal(id, cartId);
      assert.equal(version, cart.version);
      const quantity = 'quantity' in action ? Number(action.quantity) : 0;
      cart = {
        ...cart,
        version: version + 1,
        totalPrice: money(1200 * quantity),
        lineItems: quantity
          ? [
              {
                id: itemId,
                productId,
                name: { en: 'Cup' },
                quantity,
                variant: { id: 1, sku: 'CUP' },
                price: { id: 'price', value: money(1200) },
                totalPrice: money(1200 * quantity),
              },
            ]
          : [],
      } as unknown as Cart;
      return cart;
    },
  );
  assert.equal(await (await fetch(`${base}/cart`)).json(), null);
  const added = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, variantId: 1, quantity: 1 }),
  });
  assert.equal(added.status, 200);
  const cookie = added.headers.get('set-cookie')!;
  assert.match(cookie, /storefront_cart_b2c-retail-store=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookie.split(';')[0],
  };
  assert.equal(
    (await (await fetch(`${base}/cart`, { headers })).json()).quantity,
    1,
  );
  const updated = await fetch(`${base}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ quantity: 3 }),
  });
  assert.equal(updated.status, 200);
  const body = await updated.json();
  assert.equal(body.quantity, 3);
  assert.equal(body.total.amount, 3600);
  assert.equal(body.items[0].total.amount, 3600);
  const removed = await fetch(`${base}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ quantity: 0 }),
  });
  assert.equal(removed.status, 200);
  assert.deepEqual((await removed.json()).items, []);
});

test('expired carts are cleared and SDK error credentials are never serialized', async (context) => {
  context.mock.method(commerce, 'cart', async () => {
    throw { statusCode: 404 };
  });
  const expired = await fetch(`${base}/cart`, {
    headers: { Cookie: `storefront_cart_b2c-retail-store=${cartId}` },
  });
  assert.equal(await expired.json(), null);
  assert.match(expired.headers.get('set-cookie')!, /Expires=Thu, 01 Jan 1970/i);
  context.mock.method(commerce, 'products', async () => {
    throw {
      statusCode: 403,
      message: 'test-secret',
      body: { authorization: 'Bearer secret-token' },
    };
  });
  const response = await fetch(`${base}/products`);
  assert.equal(response.status, 403);
  const text = await response.text();
  assert.match(text, /access was denied/i);
  assert.doesNotMatch(text, /test-secret|secret-token|authorization/);
});
