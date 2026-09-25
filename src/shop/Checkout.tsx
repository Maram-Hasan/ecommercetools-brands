import { useState, type ReactNode } from 'react';
import { Link, useBrand } from '../brands/context';
import { formatPrice, ProductImage } from '../components';
import { useCart } from './CartContext';
import { OrderSummary } from './Cart';
import { Breadcrumbs, Icon, InlineError } from './Primitives';

export function CheckoutStep({
  number,
  title,
  active,
  complete,
  summary,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  active: boolean;
  complete: boolean;
  summary?: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`checkout-step ${active ? 'active' : ''}`}>
      <div className="checkout-step-heading">
        <span className={`step-number ${complete ? 'complete' : ''}`}>
          {complete ? <Icon name="check" size={16} /> : number}
        </span>
        <h2>{title}</h2>
        {complete && (
          <button className="text-button" onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      {complete && !active && <p className="step-summary">{summary}</p>}
      {active && <div className="checkout-step-body">{children}</div>}
    </section>
  );
}

export function Checkout() {
  const brand = useBrand();
  const {
    cart,

    liveLoading,
    liveError,
    refreshLive,
    busy,
  } = useCart();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(0);
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [address, setAddress] = useState({
    first: '',
    last: '',
    street: '',
    apartment: '',
    city: '',
    region: '',
    postal: '',
    country: 'United States',
  });
  const [shipping, setShipping] = useState('Standard delivery');
  const [payment, setPayment] = useState('approved');
  const [paymentError, setPaymentError] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    quantity: number;
    total: string;
  }>();
  function next(number: number) {
    setCompleted(Math.max(completed, number));
    setStep(number + 1);
  }
  function edit(number: number) {
    setStep(number);
    setCompleted(number - 1);
    setReviewed(false);
  }
  const titles = [
    'Contact Information',
    'Shipping Address',
    'Shipping Method',
    'Payment',
    'Order Review',
  ];
  if (confirmation)
    return (
      <div className="page-width checkout-confirmation">
        <span className="confirmation-icon">
          <Icon name="check" size={35} />
        </span>
        <p className="eyebrow">DEMO COMPLETE</p>
        <h1>A beautiful beginning.</h1>
        <p>
          You’ve completed the checkout preview for {confirmation.quantity}{' '}
          {confirmation.quantity === 1 ? 'item' : 'items'} ({confirmation.total}{' '}
          merchandise total).
        </p>
        <p>
          No order was created, no payment was taken and your contact details
          were not submitted. Your store bag is unchanged.
        </p>
        <Link href={brand.route} className="button">
          Continue Exploring
        </Link>
      </div>
    );
  if (liveError || liveLoading)
    return (
      <div className="page-width section-space">
        {liveError ? (
          <InlineError message={liveError} retry={() => void refreshLive()} />
        ) : (
          <p role="status">Loading your bag…</p>
        )}
        <Link href={`${brand.route}/cart`} className="text-link">
          Return to Bag
        </Link>
      </div>
    );
  if (!cart.items.length)
    return (
      <div className="page-width empty-state">
        <h1>Your bag is empty.</h1>
        <p>Add a favorite before trying checkout.</p>
        <Link
          href={`${brand.route}/category/${brand.home.category}`}
          className="button"
        >
          Explore the Collection
        </Link>
      </div>
    );
  return (
    <div className="page-width checkout-page">
      <Breadcrumbs
        items={[
          { label: 'Shopping Bag', href: `${brand.route}/cart` },
          { label: 'Checkout' },
        ]}
      />
      <div className="checkout-title">
        <h1>Checkout</h1>
        <span>
          <Icon name="lock" size={15} /> Demo checkout
        </span>
      </div>
      <p className="checkout-demo-note">
        Try the complete experience. Contact details stay in this page only. No
        real payment or order will be submitted.
      </p>
      <div className="checkout-layout">
        <div className="checkout-steps">
          <CheckoutStep
            number={1}
            title={titles[0]}
            active={step === 1}
            complete={completed >= 1}
            summary={contact.email}
            onEdit={() => edit(1)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next(1);
              }}
            >
              <p>Where can we keep you up to date?</p>
              <label>
                Email address
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </label>
              <label>
                Phone number <span>(optional)</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value })
                  }
                />
              </label>
              <button className="button" type="submit">
                Continue to Shipping
              </button>
            </form>
          </CheckoutStep>
          <CheckoutStep
            number={2}
            title={titles[1]}
            active={step === 2}
            complete={completed >= 2}
            summary={`${address.first} ${address.last}, ${address.street}, ${address.city}, ${address.region} ${address.postal}`}
            onEdit={() => edit(2)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next(2);
              }}
            >
              <div className="field-pair">
                <label>
                  First name
                  <input
                    required
                    autoComplete="given-name"
                    value={address.first}
                    onChange={(e) =>
                      setAddress({ ...address, first: e.target.value })
                    }
                  />
                </label>
                <label>
                  Last name
                  <input
                    required
                    autoComplete="family-name"
                    value={address.last}
                    onChange={(e) =>
                      setAddress({ ...address, last: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Street address
                <input
                  required
                  autoComplete="address-line1"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                />
              </label>
              <label>
                Apartment, suite, etc. <span>(optional)</span>
                <input
                  autoComplete="address-line2"
                  value={address.apartment}
                  onChange={(e) =>
                    setAddress({ ...address, apartment: e.target.value })
                  }
                />
              </label>
              <div className="field-pair">
                <label>
                  City
                  <input
                    required
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                </label>
                <label>
                  State / Region
                  <input
                    required
                    autoComplete="address-level1"
                    value={address.region}
                    onChange={(e) =>
                      setAddress({ ...address, region: e.target.value })
                    }
                  />
                </label>
              </div>
              <div className="field-pair">
                <label>
                  ZIP / Postal code
                  <input
                    required
                    autoComplete="postal-code"
                    value={address.postal}
                    onChange={(e) =>
                      setAddress({ ...address, postal: e.target.value })
                    }
                  />
                </label>
                <label>
                  Country
                  <select
                    value={address.country}
                    onChange={(e) =>
                      setAddress({ ...address, country: e.target.value })
                    }
                  >
                    <option>United States</option>
                    <option>Canada</option>
                  </select>
                </label>
              </div>
              <button className="button" type="submit">
                Continue to Delivery
              </button>
            </form>
          </CheckoutStep>
          <CheckoutStep
            number={3}
            title={titles[2]}
            active={step === 3}
            complete={completed >= 3}
            summary={`${shipping} · estimate pending`}
            onEdit={() => edit(3)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next(3);
              }}
            >
              <p>Choose how you’d like your favorites to arrive.</p>
              {['Standard delivery', 'White glove delivery'].map((method) => (
                <label className="shipping-option" key={method}>
                  <input
                    type="radio"
                    name="shipping"
                    value={method}
                    checked={shipping === method}
                    onChange={() => setShipping(method)}
                  />
                  <span>
                    <strong>{method}</strong>
                    <small>
                      {method === 'Standard delivery'
                        ? 'Delivered to your door'
                        : 'Room placement and packaging removal'}{' '}
                      · demo option
                    </small>
                  </span>
                  <span>Estimate pending</span>
                </label>
              ))}
              <button className="button" type="submit">
                Continue to Payment
              </button>
            </form>
          </CheckoutStep>
          <CheckoutStep
            number={4}
            title={titles[3]}
            active={step === 4}
            complete={completed >= 4}
            summary="Demo payment selected · no charge"
            onEdit={() => edit(4)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (payment === 'declined') {
                  setPaymentError(
                    'The demo payment was declined. Select the approved demo payment to continue.',
                  );
                  return;
                }
                setPaymentError('');
                next(4);
              }}
            >
              <div className="demo-payment">
                <Icon name="lock" />
                <div>
                  <strong>Demo payment only</strong>
                  <p>No card number or bank information is needed.</p>
                </div>
              </div>
              <label className="check-row">
                <input
                  type="radio"
                  name="payment"
                  value="approved"
                  checked={payment === 'approved'}
                  onChange={() => {
                    setPayment('approved');
                    setPaymentError('');
                  }}
                />
                Approved demo payment
              </label>
              <label className="check-row">
                <input
                  type="radio"
                  name="payment"
                  value="declined"
                  checked={payment === 'declined'}
                  onChange={() => setPayment('declined')}
                />
                Try a declined demo payment
              </label>
              {paymentError && <InlineError message={paymentError} />}
              <button className="button" type="submit">
                Review Your Order
              </button>
            </form>
          </CheckoutStep>
          <CheckoutStep
            number={5}
            title={titles[4]}
            active={step === 5}
            complete={false}
            onEdit={() => edit(5)}
          >
            <div className="review-items">
              {cart.items.map((item) => (
                <div key={item.id}>
                  <ProductImage src={item.image} name={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.variant}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <span>{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <p className="sample-note">
              Shipping and tax remain estimates to be calculated. Your displayed
              total is merchandise only.
            </p>
            <label className="check-row review-consent">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
              />
              I understand this completes a demo, with no purchase.
            </label>
            <button
              className="button full"
              disabled={!reviewed || busy}
              onClick={() => {
                setConfirmation({
                  quantity: cart.quantity,
                  total: formatPrice(cart.total),
                });
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            >
              Complete Demo Order
            </button>
          </CheckoutStep>
        </div>
        <OrderSummary cart={cart} checkout>
          <Link href={`${brand.route}/cart`} className="text-link">
            Edit Your Bag
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
}
