import { useState } from 'react';
import { useBrand } from '../../brands/context';
import { Link } from '../../app/router';
import { brands } from '../../../shared/brands/index';
import { Icon } from '../Primitives';
import { BrandWordmark } from './BrandWordmark';
import { InfoDialog } from '../InfoDialog';
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
