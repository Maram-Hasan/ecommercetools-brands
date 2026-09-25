export interface Money {
  amount: number;
  fractionDigits: number;
  currencyCode: string;
}

export interface Variant {
  id: number;
  sku?: string;
  images: string[];
  price: Money | null;
  originalPrice?: Money;
  attributes?: { name: string; value: string }[];
  available?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface Product {
  id: string;
  key?: string;
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

export interface Cart {
  items: {
    id: string;
    productId: string;
    name: string;
    sku?: string;
    image?: string;
    quantity: number;
    price: Money;
    total: Money;
  }[];
  total: Money;
  quantity: number;
}
