import type { Money } from '../../../shared/domain/money.js';
export interface ShopCartItem {
  id: string;
  productId: string;
  slug?: string;
  name: string;
  image?: string;
  sku?: string;
  variantId?: number;
  quantity: number;
  price: Money;
  total: Money;
}
export interface ShopCart {
  id?: string;
  version?: number;
  items: ShopCartItem[];
  total: Money;
  quantity: number;
}
