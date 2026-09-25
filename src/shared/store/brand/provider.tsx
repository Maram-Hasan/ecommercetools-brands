import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { BrandContext } from './context';
import { brands, resolveBrand } from '../../../../shared/brands/index';
import { Link, useLocation } from '../../containers/app/router';
export function BrandProvider({ children }: { children: ReactNode }) {
  const pathname = useLocation().split('?')[0];
  const brand =
    resolveBrand(pathname) ?? (pathname === '/' ? brands.fg : undefined);
  useEffect(() => {
    if (!brand) return;
    document.title = brand.displayName;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', brand.colors.primary);
  }, [brand]);
  if (!brand)
    return (
      <main className="empty-state">
        <h1>Page not found</h1>
        {Object.values(brands).map((item) => (
          <p key={item.key}>
            <Link href={item.route}>{item.displayName}</Link>
          </p>
        ))}
      </main>
    );
  const style = {
    '--primary': brand.colors.primary,
    '--ink': brand.colors.ink,
    '--muted': brand.colors.muted,
    '--wash': brand.colors.wash,
    '--promo': brand.colors.promo,
    '--logo': brand.colors.logo,
    '--wordmark-image': `url("${brand.wordmark.asset}")`,
    '--wordmark-ratio': brand.wordmark.aspectRatio,
    '--wordmark-width': brand.wordmark.desktopWidth,
    '--header-border': brand.header.border,
    '--header-surface': brand.header.surface,
    '--pdp-primary': brand.pdp?.primary,
    '--pdp-accent': brand.pdp?.accent,
    '--pdp-border': brand.pdp?.border,
    '--pdp-surface': brand.pdp?.surface,
    '--font-heading': brand.typography.heading,
    '--font-body': brand.typography.body,
    '--tracking': brand.typography.tracking,
    '--page-space': brand.spacing.page,
    '--section-space': brand.spacing.section,
    '--grid-gap': brand.spacing.grid,
    '--button-radius': brand.buttons.radius,
    '--button-case': brand.buttons.transform,
  } as CSSProperties;

  return (
    <BrandContext.Provider value={brand}>
      <div
        className="brand-app"
        data-brand={brand.key}
        data-purchase={brand.pdp.purchase}
        data-minicart={brand.minicart}
        style={style}
        key={brand.key}
      >
        {children}
      </div>
    </BrandContext.Provider>
  );
}
