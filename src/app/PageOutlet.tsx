import { useBrand } from '../brands/context';
import { Link, useLocation } from './router';
import { parseRoute } from './routes';
import { Home } from '../features/home/HomePage';
import { Category } from '../features/catalog/CategoryPage';
import { ProductDetails } from '../features/product/ProductPage';
import { Cart } from '../features/cart/CartPage';
import { Checkout } from '../features/checkout/CheckoutPage';
export function PageOutlet() {
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
