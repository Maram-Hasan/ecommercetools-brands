import { useState } from 'react';
import type { ShopProduct, ShopVariant } from '../services/models';
import { ProductImage } from '../components';
import { useCart } from './CartContext';
import { InlineError } from './Primitives';
import { Price } from './Products';
import { ProductPurchaseControls } from './ProductPurchase';

function sizeOf(variant: ShopVariant) {
  return variant.attributes?.find(({ name }) =>
    /^(size|sizelabel|sizename|dimensions)$/.test(
      name.toLowerCase().replace(/[^a-z]/g, ''),
    ),
  )?.value;
}

function optionLabel(variant: ShopVariant) {
  const values = [variant.colorLabel, sizeOf(variant)].filter(Boolean);
  return values.length ? values.join(' / ') : variant.label;
}

export function FrontgateProductInfo({
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
  const hasSizes = product.variants.some((item) => sizeOf(item));
  const colorsOnly =
    !hasSizes && product.variants.every((item) => item.colorLabel);
  const sizesOnly = product.variants.every(
    (item) => sizeOf(item) && !item.colorLabel,
  );
  const optionTitle = colorsOnly ? 'Color' : sizesOnly ? 'Size' : 'Option';
  return (
    <section className="product-info-panel fg-product-info">
      <div className="product-heading-row">
        {variant?.sku && <p className="sku">Item: #{variant.sku}</p>}
        <h1>{product.name}</h1>
      </div>
      {variant && <Price variant={variant} />}
      {variant && (
        <fieldset className="fg-options" disabled={busy}>
          <legend>
            <strong>{optionTitle}:</strong> {optionLabel(variant)}
          </legend>
          <div className="fg-option-list">
            {product.variants.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`fg-option${colorsOnly ? ' fg-color-option' : ''}`}
                aria-label={`Choose ${optionLabel(item)}`}
                aria-pressed={item.id === variant.id}
                title={`${optionLabel(item)}${item.sku ? ` — ${item.sku}` : ''}`}
                onClick={() => onSelect(item.id)}
              >
                {colorsOnly && item.swatchColor ? (
                  <span
                    className="fg-color-chip"
                    style={{ backgroundColor: item.swatchColor }}
                  />
                ) : colorsOnly && item.swatchImage ? (
                  <ProductImage
                    src={item.swatchImage}
                    name={optionLabel(item)}
                  />
                ) : (
                  <span>{optionLabel(item)}</span>
                )}
              </button>
            ))}
          </div>
        </fieldset>
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
        onQuantityChange={setQuantity}
        busy={busy}
        onAdd={() => {
          if (variant) void add(product, variant.id, quantity);
        }}
      />
      {error && <InlineError message={error} />}
      {!!variant?.attributes?.length && (
        <details className="product-specifications">
          <summary>Product Specifications</summary>
          <dl className="variant-attributes">
            {variant.attributes.map(({ name, value }) => (
              <div key={name}>
                <dt>{name.replace(/[-_]/g, ' ')}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
}
