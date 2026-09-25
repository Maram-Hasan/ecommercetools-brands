import type { Money } from '../../shared/domain/money.js';
import type { ProductCategory } from '../../shared/domain/category.js';
export interface ShopVariant {
  id: number;
  sku?: string;
  label: string;
  swatch?: string;
  images: string[];
  price: Money | null;
  originalPrice?: Money;
  attributes?: { name: string; value: string }[];
  available?: boolean;
  colorLabel?: string;
  swatchColor?: string;
  swatchImage?: string;
}
export interface ShopProduct {
  id: string;
  slug: string;
  key?: string;
  productNumber?: string;
  name: string;
  description: string;
  category: string;
  categories: ProductCategory[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  variants: ShopVariant[];
}
