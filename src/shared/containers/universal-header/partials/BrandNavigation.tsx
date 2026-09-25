import { useBrand } from '../../../store/brand/context';
import { Link } from '../../app/router';
import { useCatalog } from '../../../store/catalog/provider';

export function BrandNavigation({
  secondary = false,
  close,
}: {
  secondary?: boolean;
  close?: () => void;
}) {
  const brand = useBrand();
  const { categories } = useCatalog();
  const items = secondary
    ? brand.header.secondaryNavigation
    : brand.header.navigation;
  return (
    <nav
      className={
        secondary ? 'production-subnavigation' : 'production-navigation'
      }
      aria-label={
        secondary
          ? brand.header.layout === 'editorial'
            ? 'Featured navigation'
            : 'Seasonal navigation'
          : 'Main navigation'
      }
    >
      <ul>
        {items?.map((item) => {
          const names = item.categories ?? [item.label];
          const category = names
            .map((name) =>
              categories.find(
                (category) =>
                  category.name.toLowerCase() === name.toLowerCase(),
              ),
            )
            .find(Boolean);
          const href = category
            ? `${brand.route}/category/${encodeURIComponent(category.slug)}`
            : `${brand.route}/category/all-products?q=${encodeURIComponent(item.search ?? item.label)}`;
          return (
            <li key={item.label}>
              <Link
                href={href}
                onClick={close}
                className={
                  'emphasis' in item && item.emphasis
                    ? 'nav-emphasis'
                    : undefined
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
