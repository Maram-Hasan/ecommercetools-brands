import { useState } from 'react';
import type { ProductInfoProps } from '../../../shared/containers/universal-pdp/usePurchase';
import { Price } from '../../../shared/components/price';
import { ProductBadges } from '../../../shared/components/product-badges';
import {
  InlineError,
  QuantitySelector,
  Icon,
} from '../../../shared/components/primitives';
import { ProductOptions } from './ProductOptions';
import { formatPrice } from '../../../shared/utils/money';

export function GarnetHillProductInfo({
  product,
  mobileGallery,
  variant,
  onSelect,
  quantity,
  onQuantityChange,
  busy,
  error,
  onAdd,
}: ProductInfoProps) {
  const [saved, setSaved] = useState(false);
  const available = !!variant?.price && variant.available !== false;
  const total = variant?.price
    ? { ...variant.price, amount: variant.price.amount * quantity }
    : null;
  return (
    <section
      className="product-info-panel gh-product-info"
      aria-label="Product information"
    >
      <div className="product-heading-row">
        <h1>{product.name}</h1>
        <p className="sku">
          {product.productNumber
            ? `Item: #${product.productNumber}`
            : variant?.sku
              ? `SKU: ${variant.sku}`
              : null}
        </p>
      </div>
      <ProductBadges badges={product.badges} className="gh-product-badges" />
      {!!product.rating && (
        <div
          className="gh-review-summary"
          aria-label={`${product.rating} out of 5 stars`}
        >
          <span aria-hidden="true">★★★★☆</span>
          <button type="button">
            {product.rating.toFixed(1)} ({product.reviewCount ?? 0})
          </button>
          <button type="button">Write a review</button>
        </div>
      )}
      {variant && <Price variant={variant} />}
      {mobileGallery}
      {variant && (
        <ProductOptions
          variants={product.variants}
          variant={variant}
          busy={busy}
          onSelect={onSelect}
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
      <div className="gh-purchase-row">
        <div className="gh-quantity-total-row">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            disabled={busy}
          />
          <div className="gh-product-total">
            <span>Total:</span>
            <output aria-label="Product total" aria-live="polite">
              {formatPrice(total)}
            </output>
          </div>
        </div>
        <div className="gh-purchase-actions">
          <button
            type="button"
            className="button add-to-cart"
            disabled={busy || !available}
            onClick={onAdd}
          >
            {busy ? 'Adding…' : 'Add To Bag'}
          </button>
          <button
            type="button"
            className="gh-wishlist"
            aria-label="Save to wish list"
            aria-pressed={saved}
            onClick={() => setSaved((value) => !value)}
          >
            <Icon name="heart" size={28} />
          </button>
        </div>
      </div>
      {error && <InlineError message={error} />}
    </section>
  );
}
