import type { Cart } from '../../../shared/domain/cart.js';
import type { BrandConfig } from '../../../shared/brands/index.js';
import { normalizeCart } from '../store/cart/parsers.js';
import { commerceRequest } from './commerce-client.js';
export const cartService = {
  async cart(brand: BrandConfig) {
    return normalizeCart(
      await commerceRequest<Cart | null>(brand.storeKey, '/cart'),
    );
  },
  async add(
    brand: BrandConfig,
    productId: string,
    variantId: number,
    quantity: number,
  ) {
    return normalizeCart(
      await commerceRequest<Cart>(brand.storeKey, '/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId, quantity }),
      }),
    );
  },
  async update(brand: BrandConfig, id: string, quantity: number) {
    return normalizeCart(
      await commerceRequest<Cart>(
        brand.storeKey,
        `/cart/items/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify({ quantity }) },
      ),
    );
  },
};
