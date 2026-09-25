import type { Cart, Product, ProductPage } from '../../shared/types.js';
import type { BrandConfig } from '../../shared/storefronts.js';
import type { ShopProduct, ShopCart } from './models.js';
import { visualOption } from './product-options.js';

export async function commerceRequest<T>(
  brand: BrandConfig,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = new URL(`/api${path}`, window.location.origin);
  url.searchParams.set('store', brand.storeKey);
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.message || 'We couldn’t complete your request. Please try again.',
    );
  return data as T;
}

export function normalizeProduct(product: Product): ShopProduct {
  return {
    id: product.id,
    slug: product.id,
    name: product.name,
    description: product.description,
    category: product.categories?.at(-1)?.name || 'All Products',
    categories: product.categories ?? [],
    variants: product.variants.map((variant) => ({
      ...variant,
      ...visualOption(variant),
      label:
        variant.attributes
          ?.filter((attribute) =>
            /color|colour|size|finish/i.test(attribute.name),
          )
          .map((attribute) => attribute.value)
          .join(' / ') ||
        variant.sku ||
        `Option ${variant.id}`,
    })),
    details: [
      {
        title: 'Product Details',
        content:
          product.description ||
          'Additional product specifications are not available yet.',
      },
      {
        title: 'Shipping & Returns',
        content:
          'Delivery estimates and return options will be available when checkout is connected. This preview does not place orders.',
      },
    ],
  };
}

export function normalizeCart(cart: Cart | null): ShopCart {
  return {
    quantity: cart?.quantity ?? 0,
    total: cart?.total ?? { amount: 0, fractionDigits: 2, currencyCode: 'USD' },
    items:
      cart?.items.map((item) => ({
        ...item,
        slug: item.productId,
        variant: item.sku || 'Selected option',
      })) ?? [],
  };
}

export const commerce = {
  async products(brand: BrandConfig, offset = 0, signal?: AbortSignal) {
    const page = await commerceRequest<ProductPage>(
      brand,
      `/products?offset=${offset}`,
      { signal },
    );
    return { ...page, products: page.products.map(normalizeProduct) };
  },
  async product(brand: BrandConfig, slug: string, signal?: AbortSignal) {
    return normalizeProduct(
      await commerceRequest<Product>(
        brand,
        `/products/${encodeURIComponent(slug)}`,
        { signal },
      ),
    );
  },
  async catalog(brand: BrandConfig, signal?: AbortSignal) {
    const products = new Map<string, ShopProduct>();
    let offset = 0;
    while (true) {
      const page = await this.products(brand, offset, signal);
      for (const product of page.products) products.set(product.id, product);
      if (page.limit < 1)
        throw new Error(
          'The store returned invalid pagination. Please try again.',
        );
      offset += page.limit;
      if (offset >= page.total) break;
      if (!page.products.length || offset > 10000)
        throw new Error(
          'The complete collection could not be loaded. Please try again or narrow the Store assortment.',
        );
    }
    return [...products.values()];
  },
  async cart(brand: BrandConfig) {
    return normalizeCart(await commerceRequest<Cart | null>(brand, '/cart'));
  },
  async add(
    brand: BrandConfig,
    productId: string,
    variantId: number,
    quantity: number,
  ) {
    return normalizeCart(
      await commerceRequest<Cart>(brand, '/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId, quantity }),
      }),
    );
  },
  async update(brand: BrandConfig, id: string, quantity: number) {
    return normalizeCart(
      await commerceRequest<Cart>(
        brand,
        `/cart/items/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ quantity }) },
      ),
    );
  },
};
