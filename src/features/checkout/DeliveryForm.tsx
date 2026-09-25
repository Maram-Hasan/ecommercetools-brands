export function DeliveryForm({
  shipping,
  setShipping,
  next,
}: {
  shipping: string;
  setShipping: (value: string) => void;
  next: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        next();
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
  );
}
