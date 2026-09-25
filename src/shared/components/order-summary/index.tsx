import { useBrand } from '../../store/brand/context';
import { Link } from '../../containers/app/router';
import { formatPrice } from '../../utils/money';
import type { ShopCart } from '../../models/cart';
import { Icon } from '../primitives/index';

export function OrderSummary({
  cart,
  checkout = false,
  children,
}: {
  cart: ShopCart;
  checkout?: boolean;
  children?: React.ReactNode;
}) {
  const brand = useBrand();
  return (
    <aside className="order-summary">
      <h2>Order Summary</h2>
      <div className="summary-line">
        <span>
          Subtotal ({cart.quantity} {cart.quantity === 1 ? 'item' : 'items'})
        </span>
        <span>{formatPrice(cart.total)}</span>
      </div>
      <div className="summary-line">
        <span>Shipping</span>
        <span>Calculated later</span>
      </div>
      <div className="summary-line">
        <span>Estimated tax</span>
        <span>Calculated later</span>
      </div>
      <div className="summary-total">
        <span>Merchandise Total</span>
        <strong>{formatPrice(cart.total)}</strong>
      </div>
      <p className="summary-disclaimer">
        Shipping and tax are not included. No charges are made in this preview.
      </p>
      {!checkout && (
        <Link href={`${brand.route}/checkout`} className="button full">
          <Icon name="lock" size={16} />
          Continue to Checkout
        </Link>
      )}
      {children}
      <div className="summary-service">
        <Icon name="truck" size={20} />
        <p>
          Carefully chosen.
          <br />
          Thoughtfully delivered.
        </p>
      </div>
    </aside>
  );
}
