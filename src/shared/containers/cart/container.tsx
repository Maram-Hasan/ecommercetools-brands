import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { useCart } from '../../store/cart/provider';
import { Breadcrumbs, Icon } from '../../components/primitives/index';
import { CartStatus } from '../../components/cart-status/index';
import { CartItem } from '../../components/cart-item/index';
import { formatPrice } from '../../utils/money';
import { CartSummary } from './CartSummary';

export function Cart() {
  const brand = useBrand();
  const { cart, loadError, loading, busy } = useCart();
  const ready = !loadError && !loading;
  return (
    <div className="page-width bag-page">
      <Breadcrumbs items={[{ label: brand.cart.title }]} />
      <div className="bag-page-heading">
        <h1>{brand.cart.title}</h1>
        {cart.items.length > 0 && (
          <div className="bag-heading-totals" aria-live="polite">
            <span>
              {cart.quantity} {cart.quantity === 1 ? 'Item' : 'Items'}
            </span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        )}
      </div>
      <CartStatus />
      {cart.items.length ? (
        <div className="bag-layout">
          <section className="cart-lines" aria-label="Cart items">
            {cart.items.map((item) => (
              <CartItem item={item} key={item.id} />
            ))}
          </section>
          <CartSummary cart={cart} disabled={!ready || busy} />
        </div>
      ) : (
        ready && (
          <div className="empty-state">
            <Icon name="bag" size={50} />
            <h2>Your next favorite is waiting.</h2>
            <p>Start with the pieces that speak to you.</p>
            <Link
              className="button"
              href={`${brand.route}/category/all-products`}
            >
              Start Exploring
            </Link>
          </div>
        )
      )}
    </div>
  );
}
