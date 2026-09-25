import { ProductSpecifications } from './ProductSpecifications';
import type { ShopVariant } from '../../../models/product';
import type { ProductInfoProps } from '../usePurchase';
import { ProductImage } from '../../../components/product-image/index';
import { InlineError } from '../../../components/primitives/index';
import { Price } from '../../../components/price';
import { ProductPurchaseControls } from './ProductPurchaseControls';

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

export function TileProductInfo({
  product,
  onSelect,
  variant,
  quantity,
  onQuantityChange,
  busy,
  error,
  onAdd,
}: ProductInfoProps) {
  const hasSizes = product.variants.some((item) => sizeOf(item));
  const colorsOnly =
    !hasSizes && product.variants.every((item) => item.colorLabel);
  const sizesOnly = product.variants.every(
    (item) => sizeOf(item) && !item.colorLabel,
  );
  const optionTitle = colorsOnly ? 'Color' : sizesOnly ? 'Size' : 'Option';
  return (
    <section className="product-info-panel tile-product-info">
      <div className="product-heading-row">
        {product.productNumber ? (
          <p className="sku">Item: #{product.productNumber}</p>
        ) : (
          variant?.sku && <p className="sku">SKU: {variant.sku}</p>
        )}
        <h1>{product.name}</h1>
      </div>
      {variant && <Price variant={variant} />}
      {variant && (
        <fieldset className="tile-options" disabled={busy}>
          <legend>
            <strong>{optionTitle}:</strong> {optionLabel(variant)}
          </legend>
          <div className="tile-option-list">
            {product.variants.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`tile-option${colorsOnly ? ' tile-color-option' : ''}`}
                aria-label={`Choose ${optionLabel(item)}`}
                aria-pressed={item.id === variant.id}
                title={`${optionLabel(item)}${item.sku ? ` — ${item.sku}` : ''}`}
                onClick={() => onSelect(item.id)}
              >
                {colorsOnly && item.swatchColor ? (
                  <span
                    className="tile-color-chip"
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
        onQuantityChange={onQuantityChange}
        busy={busy}
        onAdd={onAdd}
      />
      {error && <InlineError message={error} />}
      <ProductSpecifications variant={variant} />
    </section>
  );
}
