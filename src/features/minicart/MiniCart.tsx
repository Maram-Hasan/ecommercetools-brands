import { useBrand } from '../../brands/context';
import { Link } from '../../app/router';
import { formatPrice } from '../../utils/money';
import { useCart } from '../cart/CartProvider';
import { Icon, Modal } from '../../components/Primitives';
import { CartStatus } from '../cart/CartStatus';
import { CartItem } from '../cart/CartItem';
export function MiniCart() {
  const brand = useBrand();
  const { cart, open, setOpen, loadError, loading, busy } = useCart();
  if (!open) return null;
  const ready = !loadError && !loading;
  return (
    <Modal
      title={`Your Bag (${cart.quantity})`}
      variant="drawer"
      onClose={() => setOpen(false)}
    >
      <p className="sample-note">
        Your current store bag. Checkout remains a demo.
      </p>
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
            <div className="summary-line">
              <strong>Subtotal</strong>
              <strong>{formatPrice(cart.total)}</strong>
            </div>
            <p>Shipping and tax calculated later.</p>
            <Link
              className="button secondary full"
              href={`${brand.route}/cart`}
              onClick={() => setOpen(false)}
            >
              View Bag
            </Link>
            {ready && !busy && (
              <Link
                className="button full"
                href={`${brand.route}/checkout`}
                onClick={() => setOpen(false)}
              >
                Checkout <Icon name="arrow" size={18} />
              </Link>
            )}
            <button className="text-button" onClick={() => setOpen(false)}>
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
