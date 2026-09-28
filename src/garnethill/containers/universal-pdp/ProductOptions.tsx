import type { ShopVariant } from '../../../shared/models/product';
import { ProductImage } from '../../../shared/components/product-image';

export function sizeOf(variant: ShopVariant) {
  return variant.attributes?.find(({ name }) =>
    /^(size|sizelabel|sizename)$/.test(
      name.toLowerCase().replace(/[^a-z]/g, ''),
    ),
  )?.value;
}

function Swatch({ variant }: { variant: ShopVariant }) {
  return variant.swatchColor ? (
    <span
      className="gh-color-chip"
      style={{ backgroundColor: variant.swatchColor }}
    />
  ) : variant.swatchImage ? (
    <ProductImage
      src={variant.swatchImage}
      name={variant.colorLabel || variant.label}
    />
  ) : null;
}

function isUnavailable(variant?: ShopVariant) {
  return !variant?.price || variant.available === false;
}

export function ProductOptions({
  variants,
  variant,
  busy,
  onSelect,
}: {
  variants: ShopVariant[];
  variant: ShopVariant;
  busy: boolean;
  onSelect: (id: number) => void;
}) {
  const splitOptions =
    variants.every((item) => item.colorLabel && sizeOf(item)) &&
    new Set(
      variants.map((item) => JSON.stringify([item.colorLabel, sizeOf(item)])),
    ).size === variants.length;
  const colors = [
    ...new Map(variants.map((item) => [item.colorLabel, item])).values(),
  ];
  const sizes = [...new Set(variants.map(sizeOf))];
  const colorsOnly =
    variants.every((item) => item.colorLabel && !sizeOf(item)) &&
    colors.length === variants.length;
  const sizesOnly =
    variants.every((item) => sizeOf(item) && !item.colorLabel) &&
    sizes.length === variants.length;
  const labelOf = (item: ShopVariant) =>
    colorsOnly
      ? item.colorLabel
      : sizesOnly
        ? sizeOf(item)
        : variants.filter((other) => other.label === item.label).length > 1
          ? `${item.label} (${item.sku || `Option ${item.id}`})`
          : item.label;

  const OptionLegend = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => (
    <>
      <span className="gh-option-complete" aria-hidden="true">
        ✓
      </span>
      <span>{label}</span>
      {value && <strong>{value}</strong>}
    </>
  );

  if (!splitOptions)
    return (
      <fieldset
        className={`gh-product-options ${colorsOnly ? 'gh-color-options' : 'gh-size-options'}`}
        disabled={busy}
      >
        <legend>
          <OptionLegend
            label={
              colorsOnly
                ? 'Choose Color:'
                : sizesOnly
                  ? 'Choose Size:'
                  : 'Choose Option:'
            }
            value={
              colorsOnly
                ? variant.colorLabel
                : sizesOnly
                  ? sizeOf(variant)
                  : labelOf(variant)
            }
          />
        </legend>

        <div className="gh-option-list">
          {variants.map((item) => {
            const unavailable = isUnavailable(item);
            return (
              <button
                type="button"
                key={item.id}
                className={`gh-option${colorsOnly ? ' gh-color-option' : ''}${sizesOnly ? ' gh-size-option' : ''}${unavailable ? ' gh-option-unavailable' : ''}`}
                aria-label={`Choose ${labelOf(item)}`}
                aria-pressed={item.id === variant.id}
                disabled={unavailable}
                onClick={() => onSelect(item.id)}
              >
                {colorsOnly && <Swatch variant={item} />}
                <span className={colorsOnly ? 'sr-only' : undefined}>
                  {labelOf(item)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    );

  return (
    <>
      <fieldset className="gh-product-options gh-color-options" disabled={busy}>
        <legend>
          <OptionLegend label="Choose Color:" value={variant.colorLabel} />
        </legend>
        <div className="gh-option-list">
          {colors.map((color) => {
            const unavailable = !variants.some(
              (item) =>
                item.colorLabel === color.colorLabel && !isUnavailable(item),
            );
            return (
              <button
                type="button"
                key={color.colorLabel}
                className={`gh-option gh-color-option${unavailable ? ' gh-option-unavailable' : ''}`}
                aria-label={`Choose ${color.colorLabel}`}
                aria-pressed={color.colorLabel === variant.colorLabel}
                disabled={unavailable}
                onClick={() => {
                  const matching = variants.find(
                    (item) =>
                      item.colorLabel === color.colorLabel &&
                      sizeOf(item) === sizeOf(variant),
                  );
                  onSelect(
                    (
                      matching ??
                      variants.find(
                        (item) => item.colorLabel === color.colorLabel,
                      )!
                    ).id,
                  );
                }}
              >
                <Swatch variant={color} />
                <span className="sr-only">{color.colorLabel}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="gh-product-options gh-size-options" disabled={busy}>
        <legend>
          <OptionLegend label="Choose Size:" value={sizeOf(variant)} />
        </legend>
        <div className="gh-option-list">
          {sizes.map((size) => {
            const matching = variants.find(
              (item) =>
                item.colorLabel === variant.colorLabel && sizeOf(item) === size,
            );
            const unavailable = isUnavailable(matching);
            return (
              <button
                type="button"
                key={size}
                className={`gh-option gh-size-option${unavailable ? ' gh-option-unavailable' : ''}`}
                aria-label={`Choose size ${size}`}
                aria-pressed={size === sizeOf(variant)}
                disabled={unavailable}
                onClick={() => matching && onSelect(matching.id)}
              >
                {size}
              </button>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}
