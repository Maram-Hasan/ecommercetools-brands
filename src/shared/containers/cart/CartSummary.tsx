import { useState } from 'react';
import { useBrand } from '../../store/brand/context';
import type { ShopCart } from '../../models/cart';
import { formatPrice } from '../../utils/money';
import { Link } from '../app/router';
import { Modal } from '../../components/primitives';

export function CartSummary({
  cart,
  disabled,
}: {
  cart: ShopCart;
  disabled: boolean;
}) {
  const brand = useBrand();
  const [offerMessage, setOfferMessage] = useState('');
  const [estimateMessage, setEstimateMessage] = useState('');
  const [notice, setNotice] = useState<{ title: string; message: string }>();
  return (
    <aside className="cart-sidebar" aria-label="Order summary">
      <div className="order-summary cart-summary-panel">
        <h2>Order Summary</h2>
        <div className="summary-line cart-subtotal">
          <span>Subtotal:</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
        {brand.cart.estimates && (
          <>
            <div className="summary-line cart-estimate-line">
              <span>
                Estimated Shipping:{' '}
                <button
                  className="cart-info-button"
                  aria-label="About estimated shipping"
                  onClick={() =>
                    setNotice({
                      title: 'Estimated shipping',
                      message:
                        'Shipping costs depend on your delivery address and selected delivery method. They are not included in this total.',
                    })
                  }
                >
                  i
                </button>
              </span>
              <span>TBD</span>
            </div>
            <div className="summary-line cart-estimate-line">
              <span>
                Estimated Tax:{' '}
                <button
                  className="cart-info-button"
                  aria-label="About estimated tax"
                  onClick={() =>
                    setNotice({
                      title: 'Estimated tax',
                      message:
                        'Applicable tax depends on your delivery address. Tax is not included in this total.',
                    })
                  }
                >
                  i
                </button>
              </span>
              <span>TBD</span>
            </div>
            <form
              className="cart-summary-form"
              onSubmit={(event) => {
                event.preventDefault();
                setEstimateMessage(
                  'Shipping and tax estimates are not available in this preview. Your total is unchanged.',
                );
              }}
            >
              <label className="sr-only" htmlFor="cart-postal-code">
                Enter ZIP
              </label>
              <input
                id="cart-postal-code"
                placeholder="Enter ZIP"
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[0-9]{5}(-[0-9]{4})?"
                required
                disabled={disabled}
              />
              <button className="button secondary" disabled={disabled}>
                Estimate
              </button>
            </form>
            {estimateMessage && (
              <p className="cart-form-message" role="status">
                {estimateMessage}
              </p>
            )}
          </>
        )}
        <form
          className="cart-summary-form"
          onSubmit={(event) => {
            event.preventDefault();
            setOfferMessage(
              'This preview does not apply offer codes. Your merchandise total is unchanged.',
            );
          }}
        >
          <label className="sr-only" htmlFor="cart-offer-code">
            Offer code
          </label>
          <input
            id="cart-offer-code"
            placeholder={
              brand.cart.estimates ? 'Offer Code' : 'Enter Promo Code'
            }
            required
            disabled={disabled}
          />
          <button className="button secondary" disabled={disabled}>
            Apply
          </button>
        </form>
        {offerMessage && (
          <p className="cart-form-message" role="status">
            {offerMessage}
          </p>
        )}
        <p className="cart-code-note">
          One code per order; gift cards entered in checkout.
        </p>
        <div className="summary-total">
          <span>Estimated Total:</span>
          <strong>{formatPrice(cart.total)}</strong>
        </div>
      </div>
      {!brand.cart.estimates && (
        <p className="cart-exclusions">
          Excludes applicable taxes and shipping
        </p>
      )}
      <p className="cart-checkout-terms">
        By checking out, you agree to our{' '}
        <button
          onClick={() =>
            setNotice({
              title: 'Terms of Use',
              message:
                'Terms of Use are not available in this storefront preview.',
            })
          }
        >
          Terms of Use
        </button>{' '}
        and{' '}
        <button
          onClick={() =>
            setNotice({
              title: 'Privacy Policy',
              message:
                'The Privacy Policy is not available in this storefront preview.',
            })
          }
        >
          Privacy Policy
        </button>
        .
      </p>
      {disabled ? (
        <button className="button full cart-checkout" disabled>
          Checkout Now
        </button>
      ) : (
        <Link
          href={`${brand.route}/checkout`}
          className="button full cart-checkout"
        >
          Checkout Now
        </Link>
      )}
      <button
        className="button full cart-paypal"
        disabled={disabled}
        onClick={() =>
          setNotice({
            title: 'PayPal Checkout',
            message:
              'PayPal is not connected in this preview. Select Checkout Now to continue with the demo checkout.',
          })
        }
      >
        <span className="paypal-wordmark" aria-hidden="true">
          Pay<span>Pal</span>
        </span>
        <span>
          <span className="sr-only">PayPal </span>Checkout
        </span>
      </button>
      {notice && (
        <Modal title={notice.title} onClose={() => setNotice(undefined)}>
          <p className="cart-notice">{notice.message}</p>
        </Modal>
      )}
    </aside>
  );
}
