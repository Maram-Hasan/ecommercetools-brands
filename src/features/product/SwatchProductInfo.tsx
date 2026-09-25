import { useState } from 'react';
import type { ShopProduct } from '../../domain/product';
import { useCart } from '../cart/CartProvider';
import { InlineError } from '../../components/Primitives';
import { Price } from '../catalog/Products';
import { ColorSwatchSelector } from './ColorSwatchSelector';
import { ProductPurchaseControls } from './ProductPurchaseControls';
export function SwatchProductInfo({
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
