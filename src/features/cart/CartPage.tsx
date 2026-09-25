import { useState } from 'react';
import { useBrand } from '../../brands/context';
import { Link } from '../../app/router';
import { useCart } from './CartProvider';
import { Breadcrumbs, Icon } from '../../components/Primitives';
import { CartStatus } from './CartStatus';
import { CartItem } from './CartItem';
import { OrderSummary } from './CartSummary';
export function Cart() {
  const brand = useBrand();
  const { cart, loadError, loading, busy } = useCart();
  const [offer, setOffer] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const ready = !loadError && !loading;
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
