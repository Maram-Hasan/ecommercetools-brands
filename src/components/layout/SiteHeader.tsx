import { useState } from 'react';
import { useBrand } from '../../brands/context';
import { Link } from '../../app/router';
import { Icon, Modal } from '../Primitives';
import { BrandWordmark } from './BrandWordmark';
import { Search } from '../../features/catalog/Search';
import { BrandNavigation } from './BrandNavigation';
import { InfoDialog } from '../InfoDialog';
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
            {brand.header.layout === 'editorial' && (
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
              {brand.header.layout === 'editorial' && <span>Sign In</span>}
            </button>
            <button
              onClick={openCart}
              className="cart-action"
              aria-label={`Open shopping bag, ${quantity} items`}
            >
              <Icon
                name={brand.header.layout === 'editorial' ? 'bag' : 'cart'}
                size={29}
              />
              {brand.header.layout === 'editorial' && <span>Bag</span>}
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
        {brand.header.layout === 'editorial' && (
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
