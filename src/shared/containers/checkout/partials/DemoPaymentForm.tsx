import { useState } from 'react';
import { Icon, InlineError } from '../../../components/primitives/index';

export function DemoPaymentForm({
  payment,
  setPayment,
  next,
}: {
  payment: string;
  setPayment: (value: string) => void;
  next: () => void;
}) {
  const [paymentError, setPaymentError] = useState('');
  return (
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
        next();
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
  );
}
