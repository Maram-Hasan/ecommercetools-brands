import type { ProductProjection } from '@commercetools/platform-sdk';
import type { Product } from '../../../shared/domain/product.js';
import { localize, money, attributeText } from './values.js';
import { categoryView } from './category.mapper.js';
export function productView(
  product: ProductProjection,
  locale: string,
  supplyChannelId?: string,
): Product {
  return {
    id: product.id,
    key: product.key,
    slug: localize(product.slug, locale),
    productNumber:
      attributeText(
        product.masterVariant.attributes?.find(
          (attribute) => attribute.name === 'product-number',
        )?.value,
        locale,
      ) || undefined,
    name: localize(product.name, locale),
    description: localize(product.description, locale),
    categories: [
      ...new Map(
        (product.categories ?? [])
          .flatMap((reference) => {
            const category = reference.obj;
            if (!category) return [];
            return [
              ...category.ancestors.flatMap((ancestor) =>
                ancestor.obj ? [categoryView(ancestor.obj, locale)] : [],
              ),
              categoryView(category, locale),
            ];
          })
          .map((category) => [category.id, category]),
      ).values(),
    ],
    variants: [product.masterVariant, ...product.variants].map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      available: (supplyChannelId
        ? variant.availability?.channels?.[supplyChannelId]
        : variant.availability
      )?.isOnStock,
      images: (variant.images ?? []).map((image) => image.url),
      // Use the price selected by commercetools for the same market as the cart.
      price: variant.price
        ? money(variant.price.discounted?.value ?? variant.price.value)
        : null,
      ...(variant.price?.discounted
        ? { originalPrice: money(variant.price.value) }
        : {}),
      attributes: (variant.attributes ?? []).flatMap((attribute) => {
        const value = attributeText(attribute.value, locale);
        return value ? [{ name: attribute.name, value }] : [];
      }),
    })),
  };
}
