import type { ShopVariant } from '../../domain/product';
import { ProductImage } from '../../components/ProductImage';

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
