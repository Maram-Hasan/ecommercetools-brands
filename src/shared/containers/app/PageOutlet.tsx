import { useBrand } from '../../store/brand/context';
import { Link, useLocation } from './router';
import { parseRoute } from './routes';
import { useBrandComponents } from './composition';
import { Category } from '../product-list/container';
import { ProductDetails } from '../universal-pdp/container';
import { Cart } from '../cart/container';
import { Checkout } from '../checkout/container';
export function PageOutlet() {
  const { Home } = useBrandComponents();
  const brand = useBrand();
  const location = useLocation();
  const route = parseRoute(location);
  switch (route.page) {
    case 'home':
      return <Home />;
    case 'category':
      return (
        <Category key={location} slug={route.slug} search={route.search} />
      );
    case 'product':
      return <ProductDetails key={route.slug} slug={route.slug} />;
    case 'cart':
      return <Cart />;
    case 'checkout':
      return <Checkout />;
    default:
      return (
        <div className="page-width empty-state">
          <h1>We couldn’t find that page.</h1>
          <Link href={brand.route} className="button">
            Back to Home
          </Link>
        </div>
      );
  }
}
