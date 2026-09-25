import { useState, type FormEvent } from 'react';
import { Link, navigate, useBrand } from '../brands/context';
import { brands } from '../../shared/storefronts';
import { Icon, Modal } from './Primitives';
import { useCatalog } from './CatalogContext';
import { BrandWordmark } from './BrandWordmark';

export function Search({ onSearch }: { onSearch?: () => void }) {
  const brand = useBrand();
  const [query, setQuery] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(
      `${brand.route}/category/all-products?q=${encodeURIComponent(query.trim())}`,
    );
    onSearch?.();
  }
  return (
    <form className="site-search" role="search" onSubmit={submit}>
      <input
        type="search"
        aria-label="Search products"
        placeholder={brand.header.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button aria-label="Submit search">
        <Icon name="search" size={20} />
      </button>
    </form>
  );
}

export function UtilityBar({ onInfo }: { onInfo: (title: string) => void }) {
  const brand = useBrand();
  return (
    <div className="utility-bar">
      <div>
        {brand.header.utility.map((label) => (
          <button key={label} onClick={() => onInfo(label)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BrandNavigation({
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
          ? brand.key === 'gh'
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

export function SiteHeader({
  quantity,
  openCart,
}: {
  quantity: number;
  openCart: () => void;
}) {
  const brand = useBrand();
  const [mobile, setMobile] = useState(false);
  const [info, setInfo] = useState('');
  return (
    <>
      <header className="site-header" data-header={brand.header.layout}>
        <UtilityBar onInfo={setInfo} />
        <div className="brand-header">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="header-search">
            <Search />
          </div>
          <BrandWordmark />
          <div className="header-actions">
            {brand.key === 'gh' && (
              <>
                <button
                  className="gh-service-action"
                  onClick={() => setInfo('About Garnet Hill')}
                >
                  <Icon name="book" />
                  <span>About Us</span>
                </button>
                <button
                  className="gh-service-action"
                  onClick={() => setInfo('Customer Service')}
                >
                  <Icon name="support" />
                  <span>Support</span>
                </button>
              </>
            )}
            <button
              className="account-action"
              aria-label="My Account"
              onClick={() => setInfo('My Account')}
            >
              <Icon name="user" size={28} />
              {brand.key === 'gh' && <span>Sign In</span>}
            </button>
            <button
              onClick={openCart}
              className="cart-action"
              aria-label={`Open shopping bag, ${quantity} items`}
            >
              <Icon name={brand.key === 'gh' ? 'bag' : 'cart'} size={29} />
              {brand.key === 'gh' && <span>Bag</span>}
              <span className="bag-count">{quantity}</span>
            </button>
          </div>
        </div>
        <div className="desktop-navigation">
          <BrandNavigation />
        </div>
        {!!brand.header.secondaryNavigation?.length && (
          <BrandNavigation secondary />
        )}
        {brand.key === 'gh' && (
          <Link
            className="gh-announcement"
            href={`${brand.route}/category/all-products`}
          >
            <strong>{brand.promo.headline}</strong>
            <span>{brand.promo.detail}</span>
          </Link>
        )}
      </header>
      {mobile && (
        <Modal
          title="Explore"
          variant="navigation-drawer"
          onClose={() => setMobile(false)}
        >
          <Search onSearch={() => setMobile(false)} />
          <BrandNavigation close={() => setMobile(false)} />
          <Link
            className="button secondary full"
            href={`${brand.route}/category/all-products`}
            onClick={() => setMobile(false)}
          >
            Shop All Products
          </Link>
        </Modal>
      )}
      {info && <InfoDialog title={info} onClose={() => setInfo('')} />}
    </>
  );
}

export function InfoDialog({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="info-content">
        <p>This storefront is an interactive design preview.</p>
        <p>
          {title === 'Offer Details'
            ? 'Prices and product discounts come from the connected store. Additional offer codes are not enabled yet.'
            : 'Account, customer service and marketing services are not connected in this preview. You can explore products, build a bag and try the demo checkout.'}
        </p>
        <button className="button" onClick={onClose}>
          Continue Exploring
        </button>
      </div>
    </Modal>
  );
}

export function SiteFooter() {
  const brand = useBrand();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [info, setInfo] = useState('');
  const [openColumns, setOpenColumns] = useState<string[]>([]);
  return (
    <footer className="site-footer">
      {brand.footer.highlights && (
        <div className="footer-highlights">
          {brand.footer.highlights.map((item) => (
            <button key={item.title} onClick={() => setInfo(item.title)}>
              <strong>{item.title}</strong>
              <span>{item.action}</span>
            </button>
          ))}
        </div>
      )}
      <div className="service-ribbon">
        <div>
          <Icon name="truck" />
          <span>Thoughtful delivery</span>
        </div>
        <div>
          <Icon name="heart" />
          <span>Made for a home you love</span>
        </div>
        <div>
          <Icon name="user" />
          <span>Here to help</span>
        </div>
      </div>
      <div className="footer-main">
        <div className="newsletter">
          <h2>{brand.footer.heading}</h2>
          <p>{brand.footer.description}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="button" type="submit">
              Sign Up
            </button>
          </form>
          {subscribed && (
            <p role="status">
              Thanks for trying it! No email was submitted in this preview.
            </p>
          )}
          <small>
            By signing up, you agree to receive inspiration and offers.
          </small>
        </div>
        {brand.footer.columns.map((column) => (
          <div
            className={`footer-column ${openColumns.includes(column.title) ? 'is-open' : ''}`}
            key={column.title}
          >
            <h3>{column.title}</h3>
            <button
              className="footer-toggle"
              aria-expanded={openColumns.includes(column.title)}
              aria-controls={`footer-${column.title.replaceAll(' ', '-')}`}
              onClick={() =>
                setOpenColumns((current) =>
                  current.includes(column.title)
                    ? current.filter((title) => title !== column.title)
                    : [...current, column.title],
                )
              }
            >
              {column.title}
              <span aria-hidden="true">
                {openColumns.includes(column.title) ? '−' : '+'}
              </span>
            </button>
            <div
              className="footer-links"
              id={`footer-${column.title.replaceAll(' ', '-')}`}
            >
              {column.links.map((label) => (
                <button key={label} onClick={() => setInfo(label)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <BrandWordmark />
        <p>
          © {new Date().getFullYear()} {brand.displayName}
        </p>
        <div>
          <button onClick={() => setInfo('Privacy Policy')}>Privacy</button>
          <button onClick={() => setInfo('Terms of Use')}>Terms</button>
          <button onClick={() => setInfo('Accessibility')}>
            Accessibility
          </button>
        </div>
      </div>
      <nav className="brand-switcher" aria-label="Choose brand">
        {Object.values(brands).map((b) => (
          <Link
            key={b.key}
            href={b.route}
            aria-current={brand.key === b.key ? 'page' : undefined}
          >
            {b.displayName}
          </Link>
        ))}
      </nav>
      {info && <InfoDialog title={info} onClose={() => setInfo('')} />}
    </footer>
  );
}
