import { visualOption } from '../src/domain/product-options.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProductProjection, Cart } from '@commercetools/platform-sdk';
import { productView } from '../server/commercetools/mappers/product.mapper.js';
import { cartView } from '../server/commercetools/mappers/cart.mapper.js';
import { normalizeProduct } from '../src/mappers/product.mapper.js';
import { normalizeCart } from '../src/mappers/cart.mapper.js';
import { parseRoute } from '../src/app/routes.js';
import { brands, resolveBrand } from '../shared/brands/index.js';

test('product identity preserves independent product, storefront and variant identifiers', () => {
  const product = productView(
    {
      id: 'vendor-id',
      key: 'catalog-key',
      slug: { en: 'storefront-slug' },
      name: { en: 'Chair' },
      variants: [],
      masterVariant: {
        id: 7,
        sku: 'VARIANT-SKU',
        attributes: [{ name: 'product-number', value: '12345' }],
      },
    } as unknown as ProductProjection,
    'en',
  );
  const view = normalizeProduct(product);
  assert.equal(view.id, 'vendor-id');
  assert.equal(view.key, 'catalog-key');
  assert.equal(view.slug, 'storefront-slug');
  assert.equal(view.productNumber, '12345');
  assert.equal(view.variants[0].id, 7);
  assert.equal(view.variants[0].sku, 'VARIANT-SKU');
  assert.equal('details' in view, false);
});

test('cart mapping retains version, product slug, variant and SKU without fabricated identity', () => {
  const price = {
    type: 'centPrecision',
    centAmount: 200,
    fractionDigits: 2,
    currencyCode: 'USD',
  };
  const mapped = normalizeCart(
    cartView(
      {
        id: 'cart',
        version: 9,
        totalPrice: price,
        lineItems: [
          {
            id: 'line',
            productId: 'product',
            productKey: 'key',
            productSlug: { en: 'chair' },
            name: { en: 'Chair' },
            variant: { id: 3, sku: 'SKU' },
            quantity: 2,
            price: { value: price },
            totalPrice: { ...price, centAmount: 400 },
          },
        ],
      } as unknown as Cart,
      'en',
    ),
  );
  assert.equal(mapped.version, 9);
  assert.equal(mapped.items[0].slug, 'chair');
  assert.equal(mapped.items[0].productId, 'product');
  assert.equal(mapped.items[0].variantId, 3);
  assert.equal(mapped.items[0].sku, 'SKU');
  assert.equal(mapped.quantity, 2);
});

test('routes parse slugs and query separately and reject malformed or extra segments', () => {
  assert.deepEqual(parseRoute('/gh/product/cotton%20linen'), {
    page: 'product',
    slug: 'cotton linen',
  });
  assert.deepEqual(parseRoute('/gr/category/chairs?q=blue'), {
    page: 'category',
    slug: 'chairs',
    search: 'q=blue',
  });
  for (const route of [
    '/unknown',
    '/fg/cart/extra',
    '/fg/product',
    '/fg/product/%ZZ',
    '/fg/product/a%2Fb',
  ])
    assert.deepEqual(parseRoute(route), { page: 'not-found' });
  assert.deepEqual(parseRoute('/'), { page: 'home' });
  assert.deepEqual(parseRoute('/fg/checkout'), { page: 'checkout' });
});

test('storefront brands have unique routes and Store keys and exclude demo configuration', () => {
  assert.equal(new Set(Object.values(brands).map((b) => b.storeKey)).size, 3);
  for (const brand of Object.values(brands))
    assert.equal(resolveBrand(brand.route + '/cart'), brand);
  assert.equal(resolveBrand('/__proto__'), undefined);
  assert.equal(resolveBrand('/b2c-retail-store'), undefined);
});

test('swatches use explicit catalog values or photography, never infer material color from its name', () => {
  const variant = {
    id: 1,
    images: ['wood.jpg'],
    price: null,
    attributes: [{ name: 'Color', value: 'Brown' }],
  };
  assert.equal(visualOption(variant).swatchColor, undefined);
  assert.equal(visualOption(variant).swatchImage, 'wood.jpg');
  const explicit = visualOption({
    ...variant,
    attributes: [...variant.attributes, { name: 'colorhex', value: '#7a5940' }],
  });
  assert.equal(explicit.swatchColor, '#7a5940');
  assert.equal(explicit.swatchImage, undefined);
  assert.equal(
    visualOption({
      ...variant,
      attributes: [{ name: 'swatchimage', value: 'javascript:invalid' }],
    }).swatchImage,
    'wood.jpg',
  );
});
