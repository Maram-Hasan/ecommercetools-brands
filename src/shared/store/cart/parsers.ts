import type { Cart } from '../../../../shared/domain/cart.js';
import type { ShopCart } from '../../models/cart.js';
export function normalizeCart(cart: Cart | null): ShopCart {
  return {
    id: cart?.id,
    version: cart?.version,
    quantity: cart?.quantity ?? 0,
    total: cart?.total ?? { amount: 0, fractionDigits: 2, currencyCode: 'USD' },
    items:
      cart?.items.map((item) => ({
        ...item,
        slug: item.productSlug,
        sku: item.sku,
      })) ?? [],
  };
}
