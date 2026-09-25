import {
  SiteHeader,
  type HeaderProps,
} from '../../../shared/containers/universal-header/container';
import { useBrand } from '../../../shared/store/brand/context';
import { Link } from '../../../shared/containers/app/router';
import { Icon } from '../../../shared/components/primitives';

export function GarnetHillHeader(props: HeaderProps) {
  const brand = useBrand();
  return (
    <SiteHeader
      {...props}
      accountLabel="Sign In"
      cartLabel="Bag"
      cartIcon="bag"
      serviceActions={(onInfo) => (
        <>
          <button
            className="gh-service-action"
            onClick={() => onInfo('About Garnet Hill')}
          >
            <Icon name="book" />
            <span>About Us</span>
          </button>
          <button
            className="gh-service-action"
            onClick={() => onInfo('Customer Service')}
          >
            <Icon name="support" />
            <span>Support</span>
          </button>
        </>
      )}
      announcement={
        <Link
          className="gh-announcement"
          href={`${brand.route}/category/all-products`}
        >
          <strong>{brand.promo.headline}</strong>
          <span>{brand.promo.detail}</span>
        </Link>
      }
    />
  );
}
