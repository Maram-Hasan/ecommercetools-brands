import { useState } from 'react';
import { Link, useBrand } from '../brands/context';
import { formatPrice, ProductImage } from '../components';
import type { ShopCart, ShopCartItem } from '../services/models';
import { useCart } from './CartContext';
import {
  Breadcrumbs,
  Icon,
  InlineError,
  Modal,
  QuantitySelector,
} from './Primitives';

export function CartItem({
  item,
  compact = false,
  onNavigate,
}: {
  item: ShopCartItem;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const brand = useBrand();
  const { busy, update, liveError, liveLoading } = useCart();
  const disabled = busy || !!liveError || liveLoading;
  const href = `${brand.route}/product/${item.slug}`;
  return (
    <article className={`bag-item ${compact ? 'compact' : ''}`}>
      <Link href={href} className="bag-item-image" onClick={onNavigate}>
        <ProductImage src={item.image} name={item.name} />
      </Link>
      <div className="bag-item-description">
        <Link href={href} onClick={onNavigate}>
          <h3>{item.name}</h3>
        </Link>
        <p>{item.variant}</p>
        <span className="bag-unit-price">{formatPrice(item.price)} each</span>
        <div className="bag-item-controls">
          <QuantitySelector
            value={item.quantity}
            disabled={disabled}
            onChange={(quantity) => void update(item.id, quantity)}
          />
          <button
            className="text-button"
            disabled={disabled}
            onClick={() => void update(item.id, 0)}
          >
            Remove
          </button>
        </div>
      </div>
      <strong className="bag-line-total">{formatPrice(item.total)}</strong>
    </article>
  );
}

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

function CartStatus() {
  const { liveLoading, liveError, refreshLive, error, dismissError } =
    useCart();
  return (
    <>
      {liveLoading && (
        <p role="status" className="sample-note">
          Refreshing your store bag…
        </p>
      )}
      {liveError && (
        <InlineError message={liveError} retry={() => void refreshLive()} />
      )}
      {error && (
        <div className="inline-error" role="alert">
          {error}
          <button className="text-button" onClick={dismissError}>
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}

export function MiniCart() {
  const brand = useBrand();
  const { cart, open, setOpen, liveError, liveLoading, busy } = useCart();
  if (!open) return null;
  const ready = !liveError && !liveLoading;
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

export function Cart() {
  const brand = useBrand();
  const { cart, liveError, liveLoading, busy } = useCart();
  const [offer, setOffer] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const ready = !liveError && !liveLoading;
  return (
    <div className="page-width bag-page">
      <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />
      <div className="bag-page-heading">
        <h1>Your Shopping Bag</h1>
        <Link
          className="text-link"
          href={`${brand.route}/category/${brand.home.category}`}
        >
          Continue Shopping
        </Link>
      </div>
      <CartStatus />
      {cart.items.length ? (
        <div className="bag-layout">
          <section>
            <div className="bag-table-heading">
              <span>Item</span>
              <span>Total</span>
            </div>
            {cart.items.map((item) => (
              <CartItem item={item} key={item.id} />
            ))}
            <div className="offer-code">
              <details>
                <summary>Have an offer code?</summary>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setOfferMessage(
                      'This preview does not apply offer codes. Your merchandise total is unchanged.',
                    );
                  }}
                >
                  <label className="sr-only" htmlFor="offer-code">
                    Offer code
                  </label>
                  <input
                    id="offer-code"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder="Enter offer code"
                    required
                  />
                  <button className="button secondary" type="submit">
                    Apply
                  </button>
                </form>
                {offerMessage && <p role="status">{offerMessage}</p>}
              </details>
            </div>
            <div className="bag-assurance">
              <Icon name="heart" />
              <p>
                Your bag is saved with this store. Checkout in this preview does
                not place a real order.
              </p>
            </div>
          </section>
          {ready && !busy ? (
            <OrderSummary cart={cart} />
          ) : (
            <aside className="order-summary">
              <h2>Order Summary</h2>
              <p>Refresh your bag or wait for your update before continuing.</p>
            </aside>
          )}
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
