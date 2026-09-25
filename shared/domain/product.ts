import type { Money } from './money.js';
import type { ProductCategory } from './category.js';
export interface Variant {
  id: number;
  sku?: string;
  images: string[];
  price: Money | null;
  originalPrice?: Money;
  attributes?: { name: string; value: string }[];
  available?: boolean;
}

export interface Product {
  id: string;
  key?: string;
  slug: string;
  productNumber?: string;
  name: string;
  description: string;
  variants: Variant[];
  categories?: ProductCategory[];
}

export interface ProductPage {
  products: Product[];
  total: number;
  offset: number;
  limit: number;
}
