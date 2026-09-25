import type { Money, ProductCategory } from '../../shared/types.js';
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
  name: string;
  description: string;
  category: string;
  categories: ProductCategory[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  variants: ShopVariant[];
  details: { title: string; content: string }[];
}
export interface ShopCartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variant: string;
  variantId?: number;
  quantity: number;
  price: Money;
  total: Money;
}
export interface ShopCart {
  items: ShopCartItem[];
  total: Money;
  quantity: number;
}
