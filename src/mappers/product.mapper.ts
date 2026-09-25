import type { Product } from '../../shared/domain/product.js';
import type { ShopProduct } from '../domain/product.js';
import { visualOption } from '../domain/product-options.js';
export function normalizeProduct(product: Product): ShopProduct {
  return {
    id: product.id,
    key: product.key,
    slug: product.slug,
    productNumber: product.productNumber,
    name: product.name,
    description: product.description,
    category: product.categories?.at(-1)?.name || '',
    categories: product.categories ?? [],
    variants: product.variants.map((variant) => ({
      ...variant,
      ...visualOption(variant),
      label:
        variant.attributes
          ?.filter((attribute) =>
            /color|colour|size|finish/i.test(attribute.name),
          )
          .map((attribute) => attribute.value)
          .join(' / ') ||
        variant.sku ||
        `Option ${variant.id}`,
    })),
  };
}
