import { useState } from 'react';
import type { ShopProduct, ShopVariant } from '../services/models';
import { formatPrice, ProductImage } from '../components';
import { useCart } from './CartContext';
import { InlineError, QuantitySelector } from './Primitives';
import { Price } from './Products';
import { useBrand } from '../brands/context';

export function ColorSwatchSelector({
  variants,
  selected,
  onChange,
  disabled = false,
}: {
  variants: ShopVariant[];
  selected: ShopVariant;
  onChange: (id: number) => void;
  disabled?: boolean;
}) {
  const isColor = variants.some((variant) => variant.colorLabel);
  return (
    <details className="color-option-panel" open>
      <summary>
        <span>
          Choose {isColor ? 'Color' : 'Option'}:{' '}
          <strong>{selected.colorLabel || selected.label}</strong>
        </span>
        <span className="option-collapse" aria-hidden="true" />
      </summary>
      <fieldset className="color-options" disabled={disabled}>
        <legend className="sr-only">
          {isColor ? 'Color' : 'Product option'}
        </legend>
        {variants.map((variant) => {
          const label = variant.colorLabel || variant.label;
          const image =
            variant.swatchImage ||
            (!variant.swatchColor ? variant.images[0] : undefined);
          return (
            <button
              key={variant.id}
              type="button"
              className={`color-option ${!image && !variant.swatchColor ? 'text-option' : ''}`}
              aria-label={`Choose ${label}${variant.colorLabel && variant.label !== label ? ` (${variant.label})` : ''}`}
              title={`${label}${variant.sku ? ` — ${variant.sku}` : ''}`}
              aria-pressed={selected.id === variant.id}
              onClick={() => onChange(variant.id)}
            >
              {image ? (
                <ProductImage src={image} name={label} />
              ) : variant.swatchColor ? (
                <span
                  className="color-chip"
                  style={{ backgroundColor: variant.swatchColor }}
                />
              ) : (
                <span>{label}</span>
              )}
            </button>
          );
        })}
      </fieldset>
    </details>
  );
}

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

export function ProductionProductInfo({
  product,
  selected,
  onSelect,
}: {
  product: ShopProduct;
  selected: number;
  onSelect: (id: number) => void;
}) {
  const { add, busy, error } = useCart();
  const [quantity, setQuantity] = useState(1);
  const variant =
    product.variants.find((item) => item.id === selected) ??
    product.variants[0];
  return (
    <section className="product-info-panel">
      <div className="product-heading-row">
        <h1>{product.name}</h1>
        {variant?.sku && <p className="sku">Item: #{variant.sku}</p>}
      </div>
      {variant && <Price variant={variant} />}
      {variant && (
        <ColorSwatchSelector
          variants={product.variants}
          selected={variant}
          onChange={onSelect}
          disabled={busy}
        />
      )}
      {/* Reviews and promotion/messaging blocks can be inserted here later. */}
      {(variant?.available !== undefined || !variant?.price) && (
        <p className="variant-availability" role="status">
          {!variant?.price
            ? 'Price unavailable for this option'
            : variant.available
              ? 'In stock'
              : 'Currently unavailable'}
        </p>
      )}
      <ProductPurchaseControls
        variant={variant}
        quantity={quantity}
        onQuantityChange={setQuantity}
        busy={busy}
        onAdd={() => {
          if (variant) void add(product, variant.id, quantity);
        }}
      />
      {error && <InlineError message={error} />}
    </section>
  );
}
