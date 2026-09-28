import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { formatPrice } from '../../utils/money';
import { useCart } from '../../store/cart/provider';
import { Icon, Modal } from '../../components/primitives/index';
import { CartStatus } from '../../components/cart-status/index';
import { CartItem } from '../../components/cart-item/index';
export function MiniCart() {
  const brand = useBrand();
  const { cart, open, setOpen, loadError, loading, busy } = useCart();
  if (!open) return null;
  const ready = !loadError && !loading;
  return (
    <Modal
      title={`In Your Bag (${cart.quantity})`}
      variant="drawer"
      onClose={() => setOpen(false)}
    >
      <CartStatus />
      {cart.items.length ? (
        <>
          <div className="mini-cart-items">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                compact
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>
          <div className="mini-cart-bottom">
            <p className="mini-cart-shipping-note">
              Taxes and shipping calculated at checkout
            </p>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <Link
              className="button full"
              href={`${brand.route}/cart`}
              onClick={() => setOpen(false)}
            >
              View Bag
            </Link>
            <button
              className="button secondary full continue-shopping"
              disabled={!ready || busy}
              onClick={() => setOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        </>
      ) : (
        ready && (
          <div className="empty-state">
            <Icon name="bag" size={40} />
            <h2>A little room for something lovely.</h2>
            <p>
              Your bag is empty. Find a new favorite to make yourself at home.
            </p>
            <Link
              className="button"
              href={`${brand.route}/category/all-products`}
              onClick={() => setOpen(false)}
            >
              Explore the Collection
            </Link>
          </div>
        )
      )}
    </Modal>
  );
}
