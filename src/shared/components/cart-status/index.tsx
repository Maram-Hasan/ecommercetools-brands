import { useCart } from '../../store/cart/provider';
import { InlineError } from '../primitives/index';

export function CartStatus() {
  const { loading, loadError, refresh, error, dismissError } = useCart();
  return (
    <>
      {loading && (
        <p role="status" className="sample-note">
          Refreshing your store bag…
        </p>
      )}
      {loadError && (
        <InlineError message={loadError} retry={() => void refresh()} />
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
