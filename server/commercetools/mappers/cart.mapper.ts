import type { Cart } from '@commercetools/platform-sdk';
import type { Cart as StoreCart } from '../../../shared/domain/cart.js';
import { localize, money } from './values.js';
export function cartView(cart: Cart, locale: string): StoreCart {
  return {
    id: cart.id,
    version: cart.version,
    items: cart.lineItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productKey: item.productKey,
      productSlug: localize(item.productSlug, locale) || undefined,
      variantId: item.variant.id,
      name: localize(item.name, locale),
      sku: item.variant.sku,
      image: item.variant.images?.[0]?.url,
      quantity: item.quantity,
      price: money(item.price.discounted?.value ?? item.price.value),
      total: money(item.totalPrice),
    })),
    total: money(cart.totalPrice),
    quantity: cart.lineItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}
