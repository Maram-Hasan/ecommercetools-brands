import type { Money } from './money.js';
export interface Cart {
  id?: string;
  version?: number;
  items: {
    id: string;
    productId: string;
    productKey?: string;
    productSlug?: string;
    variantId?: number;
    name: string;
    sku?: string;
    productNumber?: string;
    attributes?: { name: string; value: string }[];
    available?: boolean;
    image?: string;
    quantity: number;
    price: Money;
    total: Money;
  }[];
  total: Money;
  quantity: number;
}
