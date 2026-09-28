import { useState } from 'react';
import { InfoDialog } from '../../../shared/components/info-dialog';

const columns = [
  {
    title: 'Customer Service',
    links: [
      'Contact Us',
      'Order Status',
      'Shipping & Handling',
      'Returns & Exchanges',
      '800.870.3513',
      'Refer A Friend | Give 25% Off, Get 25% Off!',
    ],
  },
  {
    title: 'Our Company',
    links: [
      'About Us',
      'Our Brands',
      'Our Responsibility',
      'Our Stores',
      'Design Services',
      'Careers ↗',
      'QVC Group ↗',
    ],
  },
  {
    title: 'Shopping Tools',
    links: [
      'Digital Catalog',
      'Weekly Sale',
      'Request a Catalog',
      'Wish List',
      'Gift Cards',
      'Design / Trade Program',
      'Inspiration Hub',
    ],
  },
];

function SocialIcon({
  name,
}: {
  name: 'facebook' | 'instagram' | 'pinterest';
}) {
  const paths = {
    facebook: (
      <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.7.3-1 1-1Z" />
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    pinterest: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 19c.8-2.5 1.2-3.8 1.7-6.3-.8-1.7.2-4.4 2.1-4.4 1.5 0 2.1 1.1 2.1 2.4 0 1.5-1 3.8-2.9 3.8-1 0-1.7-.8-1.5-1.8M8.6 7.8c2.1-2.1 7.6-2 8.8 1.2 1.6 4.3-1.8 8.1-5.4 7.2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function GarnetHillFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [info, setInfo] = useState('');
  const [expandedColumn, setExpandedColumn] = useState('');
  return (
    <footer className="site-footer gh-footer">
      <div className="gh-footer-main">
        <section
          className="gh-footer-connect"
          aria-labelledby="gh-connect-title"
        >
          <h2 id="gh-connect-title">Connect</h2>
          <p>Join our email list</p>
          <form
            aria-label="Garnet Hill email updates"
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <label className="sr-only" htmlFor="gh-footer-email">
              Your email
            </label>
            <input
              id="gh-footer-email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          <p>Get the inside scoop on exclusive sales and new arrivals!</p>
          {subscribed && (
            <p role="status">Thanks for joining our email list.</p>
          )}
          <div className="gh-social-links" aria-label="Social media">
            {(['facebook', 'instagram', 'pinterest'] as const).map((name) => (
              <button
                key={name}
                aria-label={name}
                onClick={() => setInfo(name)}
              >
                <SocialIcon name={name} />
              </button>
            ))}
          </div>
        </section>
        {columns.map((column) => {
          const expanded = expandedColumn === column.title;
          const linksId = `gh-footer-${column.title.toLowerCase().replaceAll(' ', '-')}`;
          return (
            <section
              className={`footer-column${expanded ? ' expanded' : ''}`}
              key={column.title}
            >
              <button
                type="button"
                className="footer-column-toggle"
                aria-expanded={expanded}
                aria-controls={linksId}
                onClick={() => setExpandedColumn(expanded ? '' : column.title)}
              >
                <span>{column.title}</span>
                <span className="footer-column-indicator" aria-hidden="true">
                  {expanded ? '−' : '+'}
                </span>
              </button>
              <div className="footer-links" id={linksId}>
                {column.links.map((label) => (
                  <button key={label} onClick={() => setInfo(label)}>
                    {label}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <nav className="gh-footer-legal" aria-label="Legal">
        {[
          'Legal',
          'Accessibility',
          'CA Supply Chains Transparency',
          'Conditions Of Use',
          'Privacy & Security',
          'ⓘ Your Privacy Choices',
        ].map((label) => (
          <button key={label} onClick={() => setInfo(label)}>
            {label}
          </button>
        ))}
      </nav>
      {info && <InfoDialog title={info} onClose={() => setInfo('')} />}
    </footer>
  );
}
