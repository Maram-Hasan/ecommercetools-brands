import { useEffect, type CSSProperties } from 'react';
import { BrandContext, Link, useBrand, useLocation } from './context';
import { resolveBrand, brands } from '../../shared/storefronts';
import LegacyApp from '../App';
import legacyStyles from '../styles.css?url';
import { SiteHeader, SiteFooter } from '../shop/Shell';
import { Home } from '../shop/Home';
import { Category } from '../shop/Category';
import { ProductDetails } from '../shop/ProductDetails';
import { CartProvider, useCart } from '../shop/CartContext';
import { Cart, MiniCart } from '../shop/Cart';
import { Checkout } from '../shop/Checkout';
import { CatalogProvider } from '../shop/CatalogContext';
import './site-header-base.css';
import './brand.css';
import './site-header.css';
import './gr-pdp.css';
import './fg-pdp.css';
import './gh.css';
import './fonts.css';
import './brand-wordmark.css';

export default function BrandApp() {
  const location = useLocation();
  const pathname = location.split('?')[0];
  const legacy =
    pathname === '/' &&
    new URLSearchParams(window.location.search).has('store');
  const brand =
    resolveBrand(pathname) ?? (pathname === '/' ? brands.fg : undefined);
  useEffect(() => {
    if (brand && !legacy) {
      document.title = `${brand.displayName} | Furniture & Home Décor`;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', brand.colors.primary);
    }
  }, [brand, legacy]);
  if (legacy) return <LegacyStorefront />;
  if (!brand)
    return (
      <main className="state-panel">
        <h1>Page not found</h1>
        <Link href="/fg">Explore Frontgate</Link> ·{' '}
        <Link href="/gr">Explore Grandin Road</Link>
        {' · '}
        <Link href="/gh">Explore Garnet Hill</Link>
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
        data-minicart={brand.minicart}
        style={style}
        key={brand.key}
      >
        <CartProvider>
          <CatalogProvider>
            <Storefront location={location} />
          </CatalogProvider>
        </CartProvider>
      </div>
    </BrandContext.Provider>
  );
}

function LegacyStorefront() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = legacyStyles;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);
  return <LegacyApp />;
}

function Storefront({ location }: { location: string }) {
  const brand = useBrand();
  const { cart, setOpen } = useCart();
  const [path, search = ''] = location.split('?');
  const parts = path.split('/').filter(Boolean);
  const page = parts[1] || 'home';
  const slug = parts[2] || '';
  const valid =
    parts.length <= (page === 'category' || page === 'product' ? 3 : 2);
  useEffect(() => {
    setOpen(false);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader quantity={cart.quantity} openCart={() => setOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        {valid && page === 'home' ? (
          <Home />
        ) : valid && page === 'category' && slug ? (
          <Category key={location} slug={slug} search={search} />
        ) : valid && page === 'product' && slug ? (
          <ProductDetails key={slug} slug={slug} />
        ) : valid && page === 'cart' ? (
          <Cart />
        ) : valid && page === 'checkout' ? (
          <Checkout />
        ) : (
          <div className="page-width empty-state">
            <h1>We couldn’t find that page.</h1>
            <Link href={brand.route} className="button">
              Back to Home
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
      <MiniCart />
    </>
  );
}
