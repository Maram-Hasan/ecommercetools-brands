import { DemoPaymentForm } from './partials/DemoPaymentForm';
import { DeliveryForm } from './partials/DeliveryForm';
import { AddressForm } from './partials/AddressForm';
import { ContactForm } from './partials/ContactForm';
import { useState } from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { formatPrice } from '../../utils/money';
import { ProductImage } from '../../components/product-image/index';
import { useCart } from '../../store/cart/provider';
import { OrderSummary } from '../../components/order-summary/index';
import {
  Breadcrumbs,
  Icon,
  InlineError,
} from '../../components/primitives/index';
import { CheckoutStep } from './partials/CheckoutStep';
export function Checkout() {
  const brand = useBrand();
  const {
    cart,

    loading,
    loadError,
    refresh,
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
  if (loadError || loading)
    return (
      <div className="page-width section-space">
        {loadError ? (
          <InlineError message={loadError} retry={() => void refresh()} />
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
            <ContactForm
              contact={contact}
              setContact={setContact}
              next={() => next(1)}
            />
          </CheckoutStep>
          <CheckoutStep
            number={2}
            title={titles[1]}
            active={step === 2}
            complete={completed >= 2}
            summary={`${address.first} ${address.last}, ${address.street}, ${address.city}, ${address.region} ${address.postal}`}
            onEdit={() => edit(2)}
          >
            <AddressForm
              address={address}
              setAddress={setAddress}
              next={() => next(2)}
            />
          </CheckoutStep>
          <CheckoutStep
            number={3}
            title={titles[2]}
            active={step === 3}
            complete={completed >= 3}
            summary={`${shipping} · estimate pending`}
            onEdit={() => edit(3)}
          >
            <DeliveryForm
              shipping={shipping}
              setShipping={setShipping}
              next={() => next(3)}
            />
          </CheckoutStep>
          <CheckoutStep
            number={4}
            title={titles[3]}
            active={step === 4}
            complete={completed >= 4}
            summary="Demo payment selected · no charge"
            onEdit={() => edit(4)}
          >
            <DemoPaymentForm
              payment={payment}
              setPayment={setPayment}
              next={() => next(4)}
            />
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
                    <p>{item.sku || 'Selected option'}</p>
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
