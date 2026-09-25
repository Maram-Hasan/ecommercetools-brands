import type { Cart } from '../../../shared/domain/cart';
import { useStorefront } from '../storefront';
import { BagIcon } from '../components';
import { ErrorState } from '../components';
import { formatPrice } from '../../utils/money';
import { Loading } from '../components';
import { ProductImage } from '../../components/ProductImage';

interface Props {
  cart: Cart | null | undefined;
  loading: boolean;
  error: string;
  busy: boolean;
  retry: () => void;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
}

export function CartPage({
  cart,
  loading,
  error,
  busy,
  retry,
  updateQuantity,
}: Props) {
  const store = useStorefront();
  return (
    <section className="cart-page">
      <a href="#/" className="back-link">
        ← Continue exploring
      </a>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{store.name.toUpperCase()} · YOUR FINDS</p>
          <h1>Shopping bag</h1>
        </div>
        <span className="muted">{cart?.quantity ?? 0} items</span>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={retry} />
      ) : !cart?.items.length ? (
        <div className="state-panel empty-cart">
          <BagIcon />
          <h2>A little room for your favorites.</h2>
          <p>Your bag is empty. Find something you’ll love having around.</p>
          <a href="#/" className="button">
            Explore the collection
          </a>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <a href={`#/products/${item.productId}`} className="cart-image">
                  <ProductImage src={item.image} name={item.name} />
                </a>
                <div className="cart-item-info">
                  <a href={`#/products/${item.productId}`}>
                    <h2>{item.name}</h2>
                  </a>
                  {item.sku && <p className="product-code">{item.sku}</p>}
                  <p>{formatPrice(item.price)} each</p>
                  <div className="item-actions">
                    <div
                      className="quantity-control"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        disabled={busy || item.quantity <= 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() =>
                          void updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        disabled={busy || item.quantity >= 99}
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() =>
                          void updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-button"
                      disabled={busy}
                      onClick={() => void updateQuantity(item.id, 0)}
                    >
                      Remove<span className="sr-only"> {item.name}</span>
                    </button>
                  </div>
                </div>
                <strong className="line-total">
                  {formatPrice(item.total)}
                </strong>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <p className="eyebrow">AT A GLANCE</p>
            <h2>Your bag</h2>
            <div className="summary-row">
              <span>Items</span>
              <span>{cart.quantity}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(cart.total)}</strong>
            </div>
            <p className="muted">
              Merchandise total. Shipping and tax are not calculated in this
              demo.
            </p>
            <a href="#/" className="button secondary">
              Continue shopping <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      )}
    </section>
  );
}
