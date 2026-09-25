import { useBrand } from '../../store/brand/context';
import { Link } from '../../containers/app/router';

/** The same source artwork is used in the header and footer at its intrinsic ratio. */
export function BrandWordmark() {
  const brand = useBrand();
  return (
    <Link
      href={brand.route}
      className="brand-wordmark"
      aria-label={`${brand.displayName} home`}
    >
      <span className="brand-wordmark-artwork" aria-hidden="true" />
    </Link>
  );
}
