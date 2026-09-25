import type { ShopVariant } from '../../../models/product';
import { formatPrice } from '../../../utils/money';
import { QuantitySelector } from '../../../components/primitives/index';
import { useBrand } from '../../../store/brand/context';

export function ProductPurchaseControls({
  variant,
  quantity,
  onQuantityChange,
  busy,
  onAdd,
}: {
  variant?: ShopVariant;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  busy: boolean;
  onAdd: () => void;
}) {
  const brand = useBrand();
  const total = variant?.price
    ? { ...variant.price, amount: variant.price.amount * quantity }
    : null;
  return (
    <div className="product-purchase">
      <div className="quantity-total-row">
        <div className="purchase-quantity">
          <span>Qty:</span>
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            disabled={busy}
          />
        </div>
        <div className="product-total">
          <span>TOTAL:</span>
          <output aria-label="Product total" aria-live="polite">
            {formatPrice(total)}
          </output>
        </div>
      </div>
      <button
        className="button add-to-cart"
        disabled={busy || !variant?.price || variant.available === false}
        onClick={onAdd}
      >
        {busy ? 'ADDING…' : (brand.pdp?.addLabel ?? 'ADD TO CART')}
      </button>
    </div>
  );
}
