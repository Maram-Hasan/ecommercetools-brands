import type { Product, ProductPage } from '../../../shared/domain/product.js';
import type { BrandConfig } from '../../../shared/brands/index.js';
import type { ShopProduct } from '../models/product.js';
import { normalizeProduct } from '../store/catalog/parsers.js';
import { commerceRequest } from './commerce-client.js';
export const catalogService = {
  async products(brand: BrandConfig, offset = 0, signal?: AbortSignal) {
    const page = await commerceRequest<ProductPage>(
      brand.storeKey,
      `/products?offset=${offset}`,
      { signal },
    );
    return { ...page, products: page.products.map(normalizeProduct) };
  },
  async product(brand: BrandConfig, slug: string, signal?: AbortSignal) {
    return normalizeProduct(
      await commerceRequest<Product>(
        brand.storeKey,
        `/products/${/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(slug) ? '' : 'by-slug/'}${encodeURIComponent(slug)}`,
        { signal },
      ),
    );
  },
  async catalog(brand: BrandConfig, signal?: AbortSignal) {
    const products = new Map<string, ShopProduct>();
    let offset = 0;
    while (true) {
      const page = await this.products(brand, offset, signal);
      for (const product of page.products) products.set(product.id, product);
      if (page.limit < 1)
        throw new Error(
          'The store returned invalid pagination. Please try again.',
        );
      offset += page.limit;
      if (offset >= page.total) break;
      if (!page.products.length || offset > 10000)
        throw new Error(
          'The complete collection could not be loaded. Please try again or narrow the Store assortment.',
        );
    }
    return [...products.values()];
  },
};
