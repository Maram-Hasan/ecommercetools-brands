import type { Variant } from '../../shared/domain/product.js';
import type { ShopProduct, ShopVariant } from './product.js';

// Only values supplied on real variants become options. Unknown colors use the
// variant photograph or a text tile; no additional variants are manufactured.
export function visualOption(variant: Variant) {
  const attributes = (variant.attributes ?? []).map(({ name, value }) => ({
    name: name.toLowerCase().replace(/[^a-z]/g, ''),
    value,
  }));
  const colorLabel = attributes.find(({ name }) =>
    /^(color|colour|colorname|colourname|colorlabel|colourlabel|searchcolor|searchcolour|finishlabel)$/.test(
      name,
    ),
  )?.value;
  const colorValue = attributes.find(({ name }) =>
    /^(colorhex|colourhex|colorcode|colourcode|finishcode|swatchcolor|swatchcolour)$/.test(
      name,
    ),
  )?.value;
  const safeColor = colorValue?.trim().toLowerCase();
  const swatchColor =
    safeColor &&
    (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(safeColor) ||
      /^(black|white|red|green|blue|navy|yellow|orange|purple|pink|brown|gray|grey|beige|ivory|silver|gold|teal|olive|maroon)$/.test(
        safeColor,
      ))
      ? safeColor
      : undefined;
  const image = attributes.find(({ name }) =>
    /^(swatchimage|colorswatchimage|colourswatchimage)$/.test(name),
  )?.value;
  return {
    colorLabel,
    swatchColor,
    swatchImage:
      image && /^(https?:\/\/|\/)/i.test(image)
        ? image
        : !swatchColor
          ? variant.images[0]
          : undefined,
  };
}

export function galleryImages(product: ShopProduct, selected?: ShopVariant) {
  return [
    ...new Set([
      ...(selected?.images ?? []),
      ...product.variants.flatMap((variant) => variant.images),
    ]),
  ];
}

export function categoryTrail(product: ShopProduct) {
  const categories = product.categories;
  // Choose a leaf, then follow its actual parent references, not unrelated assignments.
  const leaf = [...categories]
    .reverse()
    .find(
      (category) => !categories.some((child) => child.parentId === category.id),
    );
  const path = [];
  const visited = new Set<string>();
  let current = leaf;
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    current = categories.find((category) => category.id === current?.parentId);
  }
  return path;
}
