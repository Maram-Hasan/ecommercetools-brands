import type { ShopVariant } from '../../../models/product';
export function ProductSpecifications({ variant }: { variant?: ShopVariant }) {
  if (!variant?.attributes?.length) return null;
  return (
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
  );
}
