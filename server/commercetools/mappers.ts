import type {
  Cart,
  Category,
  LocalizedString,
  ProductProjection,
  TypedMoney,
} from '@commercetools/platform-sdk';
import type { Cart as StoreCart, Money, Product } from '../../shared/types.js';

function attributeText(value: unknown, locale: string): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value);
  if (Array.isArray(value))
    return value
      .map((item) => attributeText(item, locale))
      .filter(Boolean)
      .join(', ');
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    if ('label' in object) return attributeText(object.label, locale);
    // References and money/structured attributes are not display labels.
    if ('typeId' in object || 'currencyCode' in object) return '';
    if (Object.values(object).every((item) => typeof item === 'string'))
      return localize(object as LocalizedString, locale);
  }
  return '';
}

function categoryView(category: Category, locale: string) {
  return {
    id: category.id,
    name: localize(category.name, locale),
    slug: localize(category.slug, locale) || category.id,
    parentId: category.parent?.id,
  };
}

export function localize(
  value: LocalizedString | undefined,
  locale: string,
): string {
  if (!value) return '';
  const language = locale.split('-')[0];
  return (
    value[locale] ||
    value[language] ||
    Object.entries(value).find(
      ([key]) => key.split('-')[0] === language,
    )?.[1] ||
    Object.values(value)[0] ||
    ''
  );
}

export function money(value: TypedMoney): Money {
  return {
    amount:
      value.type === 'highPrecision' ? value.preciseAmount : value.centAmount,
    fractionDigits: value.fractionDigits,
    currencyCode: value.currencyCode,
  };
}

export function productView(
  product: ProductProjection,
  locale: string,
  supplyChannelId?: string,
): Product {
  return {
    id: product.id,
    key: product.key,
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

export function cartView(cart: Cart, locale: string): StoreCart {
  return {
    items: cart.lineItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: localize(item.name, locale),
      sku: item.variant.sku,
      image: item.variant.images?.[0]?.url,
      quantity: item.quantity,
      price: money(item.price.discounted?.value ?? item.price.value),
      total: money(item.totalPrice),
    })),
    total: money(cart.totalPrice),
    quantity: cart.lineItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}
