import type { Money } from '../../../shared/domain/money.js';
import type { ProductCategory } from '../../../shared/domain/category.js';
import type { Product } from '../../../shared/domain/product.js';
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
  catalogSort?: Product['catalogSort'];
  id: string;
  slug: string;
  key?: string;
  productNumber?: string;
  name: string;
  description: string;
  category: string;
  categories: ProductCategory[];
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  variants: ShopVariant[];
}
