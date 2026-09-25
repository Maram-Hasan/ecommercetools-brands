import { useState, type ReactNode } from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { Icon, Modal } from '../../components/primitives/index';
import { BrandWordmark } from '../../components/brand-wordmark/index';
import { Search } from '../../components/search/index';
import { BrandNavigation } from './partials/BrandNavigation';
import { InfoDialog } from '../../components/info-dialog/index';
function UtilityBar({ onInfo }: { onInfo: (title: string) => void }) {
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

export interface HeaderProps {
  quantity: number;
  openCart: () => void;
}

interface HeaderSlots {
  serviceActions?: (onInfo: (title: string) => void) => ReactNode;
  announcement?: ReactNode;
  accountLabel?: string;
  cartLabel?: string;
  cartIcon?: 'bag' | 'cart';
}

export function SiteHeader({
  quantity,
  openCart,
  serviceActions,
  announcement,
  accountLabel,
  cartLabel,
  cartIcon = 'cart',
}: HeaderProps & HeaderSlots) {
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
            {serviceActions?.(setInfo)}
            <button
              className="account-action"
              aria-label="My Account"
              onClick={() => setInfo('My Account')}
            >
              <Icon name="user" size={28} />
              {accountLabel && <span>{accountLabel}</span>}
            </button>
            <button
              onClick={openCart}
              className="cart-action"
              aria-label={`Open shopping bag, ${quantity} items`}
            >
              <Icon name={cartIcon} size={29} />
              {cartLabel && <span>{cartLabel}</span>}
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
        {announcement}
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
