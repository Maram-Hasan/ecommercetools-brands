import type { ProductInfoProps } from '../usePurchase';
import { InlineError } from '../../../components/primitives/index';
import { Price } from '../../../components/price';
import { ColorSwatchSelector } from './ColorSwatchSelector';
import { ProductPurchaseControls } from './ProductPurchaseControls';
export function SwatchProductInfo({
  product,
  onSelect,
  variant,
  quantity,
  onQuantityChange,
  busy,
  error,
  onAdd,
}: ProductInfoProps) {
  return (
    <section className="product-info-panel">
      <div className="product-heading-row">
        <h1>{product.name}</h1>
        {product.productNumber ? (
          <p className="sku">Item: #{product.productNumber}</p>
        ) : (
          variant?.sku && <p className="sku">SKU: {variant.sku}</p>
        )}
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
        onQuantityChange={onQuantityChange}
        busy={busy}
        onAdd={onAdd}
      />
      {error && <InlineError message={error} />}
    </section>
  );
}
