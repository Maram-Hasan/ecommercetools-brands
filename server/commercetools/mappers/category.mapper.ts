import type { Category } from '@commercetools/platform-sdk';
import { localize } from './values.js';
export function categoryView(category: Category, locale: string) {
  return {
    id: category.id,
    name: localize(category.name, locale),
    slug: localize(category.slug, locale) || category.id,
    parentId: category.parent?.id,
  };
}
