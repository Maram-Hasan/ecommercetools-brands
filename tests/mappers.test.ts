import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProductProjection } from '@commercetools/platform-sdk';
import { localize } from '../server/commercetools/mappers/values.js';
import { money } from '../server/commercetools/mappers/values.js';
import { productView } from '../server/commercetools/mappers/product.mapper.js';
import { normalizeProduct } from '../src/shared/store/catalog/parsers.js';
import {
  galleryImages,
  categoryTrail,
} from '../src/shared/models/product-options.js';

test('catalog sorting retains creation date and review scores without changing product-card presentation', () => {
  const product = {
    id: 'new-product',
    name: { en: 'New Arrival' },
    createdAt: '2026-09-01T00:00:00Z',
    reviewRatingStatistics: { averageRating: 4.8, count: 12 },
    masterVariant: { id: 1 },
    variants: [],
  } as unknown as ProductProjection;
  const normalized = normalizeProduct(productView(product, 'en'));
  assert.deepEqual(normalized.catalogSort, {
    createdAt: '2026-09-01T00:00:00Z',
    rating: 4.8,
    reviewCount: 12,
  });
  assert.equal(normalized.rating, undefined);
});

test('localized names fall back to the same language, then another available translation', () => {
  assert.equal(localize({ 'en-GB': 'Chair', de: 'Stuhl' }, 'en-US'), 'Chair');
  assert.equal(localize({ de: 'Stuhl' }, 'fr'), 'Stuhl');
  assert.equal(localize(undefined, 'en'), '');
});

test('badge arrays retain separate localized labels from product or master-variant attributes', () => {
  const product = {
    id: 'badged-product',
    name: { en: 'Chair' },
    variants: [],
    masterVariant: {
      id: 1,
      attributes: [
        {
          name: 'badge',
          value: [
            ' New ',
            { key: 'exclusive', label: { en: 'Exclusive', de: 'Exklusiv' } },
            'New',
            '',
            null,
            { typeId: 'product', id: 'hidden' },
            'Soft, durable',
          ],
        },
        { name: 'finish', value: 'Ivory' },
      ],
    },
  } as unknown as ProductProjection;
  const mapped = productView(product, 'en');
  assert.deepEqual(mapped.badges, ['New', 'Exclusive', 'Soft, durable']);
  assert.deepEqual(normalizeProduct(mapped).badges, mapped.badges);
  assert.deepEqual(mapped.variants[0].attributes, [
    { name: 'finish', value: 'Ivory' },
  ]);
  assert.deepEqual(productView(product, 'de').badges, [
    'New',
    'Exklusiv',
    'Soft, durable',
  ]);
  assert.deepEqual(
    productView(
      {
        ...product,
        attributes: [
          {
            name: 'badge',
            value: [
              { key: 'best', label: 'Best Seller' },
              { en: 'Limited Edition' },
            ],
          },
        ],
      },
      'en',
    ).badges,
    ['Best Seller', 'Limited Edition'],
  );
  assert.deepEqual(
    productView(
      { ...product, attributes: [{ name: 'badge', value: [] }] },
      'en',
    ).badges,
    [],
  );
  assert.deepEqual(
    productView({ ...product, masterVariant: { id: 1 } }, 'en').badges,
    [],
  );
});

test('live Badge casing and single enum values reach the storefront', () => {
  const product = {
    id: '42691753-230a-4edf-bd0d-a5ab268267f5',
    name: { 'en-US': 'Cashmere Ankle Socks' },
    attributes: [
      { name: 'Badge', value: { key: 'New Color', label: 'New Color' } },
    ],
    masterVariant: { id: 1 },
    variants: [],
  } as unknown as ProductProjection;
  assert.deepEqual(normalizeProduct(productView(product, 'en-US')).badges, [
    'New Color',
  ]);
  const variantBadge = productView(
    {
      ...product,
      attributes: [],
      masterVariant: {
        id: 1,
        attributes: [
          {
            name: 'Badge',
            value: [
              { key: 'new', label: 'New' },
              { key: 'color', label: 'New Color' },
            ],
          },
        ],
      },
    },
    'en-US',
  );
  assert.deepEqual(variantBadge.badges, ['New', 'New Color']);
  assert.deepEqual(variantBadge.variants[0].attributes, []);
});

test('money retains currency precision rather than assuming two decimal places', () => {
  assert.deepEqual(
    money({
      type: 'centPrecision',
      currencyCode: 'JPY',
      centAmount: 1200,
      fractionDigits: 0,
    }),
    {
      amount: 1200,
      currencyCode: 'JPY',
      fractionDigits: 0,
    },
  );
  assert.deepEqual(
    money({
      type: 'highPrecision',
      currencyCode: 'USD',
      centAmount: 123,
      preciseAmount: 1234,
      fractionDigits: 3,
    }),
    {
      amount: 1234,
      currencyCode: 'USD',
      fractionDigits: 3,
    },
  );
});

test('only a market-selected price is displayed, including its product discount', () => {
  const price = {
    id: 'price',
    value: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 2000,
      fractionDigits: 2,
    },
  };
  const product = {
    id: 'product',
    name: { en: 'Cup' },
    variants: [],
    masterVariant: { id: 1, prices: [price] },
  } as unknown as ProductProjection;
  assert.equal(productView(product, 'en').variants[0].price, null);
  const selectedPrice = {
    ...price,
    discounted: {
      value: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1500,
        fractionDigits: 2,
      },
      discount: { typeId: 'product-discount', id: 'discount' },
    },
  } as ProductProjection['masterVariant']['price'];
  const pricedProduct = {
    ...product,
    masterVariant: { ...product.masterVariant, price: selectedPrice },
  };
  assert.equal(
    productView(pricedProduct, 'en').variants[0].price?.amount,
    1500,
  );
  assert.deepEqual(productView(product, 'en').variants[0].images, []);
  assert.equal(
    productView(pricedProduct, 'en').variants[0].originalPrice?.amount,
    2000,
  );
  assert.equal(productView(product, 'en').variants[0].originalPrice, undefined);
});

test('category navigation and localized variant attributes come from projections', () => {
  const parent = {
    id: 'furniture',
    name: { en: 'Furniture' },
    slug: { en: 'furniture' },
    ancestors: [],
  };
  const product = {
    id: 'chair',
    name: { en: 'Chair' },
    categories: [
      {
        id: 'chairs',
        obj: {
          id: 'chairs',
          name: { en: 'Chairs' },
          slug: { en: 'chairs' },
          parent: { id: 'furniture' },
          ancestors: [{ id: 'furniture', obj: parent }],
        },
      },
    ],
    masterVariant: {
      id: 1,
      attributes: [
        {
          name: 'finish',
          value: { key: 'walnut', label: { en: 'Walnut', de: 'Walnuss' } },
        },
        { name: 'size', value: 'Large' },
        { name: 'reference', value: { typeId: 'product', id: 'private-id' } },
      ],
    },
    variants: [],
  } as unknown as ProductProjection;
  const mapped = productView(product, 'en');
  assert.deepEqual(
    mapped.categories?.map((category) => category.name),
    ['Furniture', 'Chairs'],
  );
  assert.equal(mapped.categories?.[1].parentId, 'furniture');
  assert.deepEqual(mapped.variants[0].attributes, [
    { name: 'finish', value: 'Walnut' },
    { name: 'size', value: 'Large' },
  ]);
});

test('availability uses the selected supply channel and preserves unknown status', () => {
  const product = {
    id: 'p',
    name: { en: 'Bag' },
    variants: [],
    masterVariant: {
      id: 1,
      availability: {
        isOnStock: true,
        channels: { 'store-channel': { isOnStock: false } },
      },
    },
  } as unknown as ProductProjection;
  assert.equal(productView(product, 'en').variants[0].available, true);
  assert.equal(
    productView(product, 'en', 'store-channel').variants[0].available,
    false,
  );
  assert.equal(
    productView(product, 'en', 'unknown-channel').variants[0].available,
    undefined,
  );
});

test('PDP options and gallery use actual variant attributes and images', () => {
  const product = normalizeProduct({
    id: 'p',
    slug: 'bag',
    name: 'Bag',
    description: '',
    categories: [
      { id: 'other', name: 'New', slug: 'new' },
      { id: 'parent', name: 'Seasonal', slug: 'seasonal' },
      { id: 'leaf', name: 'Storage', slug: 'storage', parentId: 'parent' },
    ],
    variants: [
      {
        id: 1,
        sku: 'RED',
        images: ['red.jpg', 'detail.jpg'],
        price: null,
        attributes: [{ name: 'Color', value: 'Red' }],
      },
      {
        id: 2,
        sku: 'PATTERN',
        images: ['pattern.jpg', 'detail.jpg'],
        price: null,
        attributes: [{ name: 'Color', value: 'Tartan' }],
      },
      { id: 3, sku: 'PLAIN', images: [], price: null },
    ],
  });
  assert.equal(product.variants.length, 3);
  assert.equal(product.variants[0].swatchColor, undefined);
  assert.equal(product.variants[0].swatchImage, 'red.jpg');
  assert.equal(product.variants[0].colorLabel, 'Red');
  assert.equal(product.variants[1].swatchColor, undefined);
  assert.equal(product.variants[2].label, 'PLAIN');
  assert.equal(
    product.variants[0].swatch,
    undefined,
    'Classic FG option presentation stays unchanged',
  );
  assert.deepEqual(galleryImages(product, product.variants[1]), [
    'pattern.jpg',
    'detail.jpg',
    'red.jpg',
  ]);
  assert.deepEqual(
    categoryTrail(product).map((item) => item.id),
    ['parent', 'leaf'],
  );
});
