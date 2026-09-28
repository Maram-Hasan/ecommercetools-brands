import type { ShopProduct } from '../../../shared/models/product';

const matches = (name: string, pattern: RegExp) =>
  pattern.test(name.toLowerCase().replace(/[^a-z]/g, ''));

export function GarnetHillProductDetails({
  product,
}: {
  product: ShopProduct;
}) {
  const attributes = product.variants[0]?.attributes ?? [];
  const materials = attributes.filter(({ name }) =>
    matches(name, /material|fabric|care|composition/),
  );
  const fit = attributes.filter(({ name }) =>
    matches(name, /size|fit|length|dimension|height|width/),
  );
  return (
    <section
      className="gh-product-details"
      id="product-details"
      aria-label="Product details"
    >
      <div>
        <h2>Details</h2>
        <p>
          {product.description ||
            'Additional product details are not available yet.'}
        </p>
      </div>
      <div>
        <h2>Materials + Care</h2>
        {materials.length > 0 && (
          <ul>
            {materials.map(({ name, value }) => (
              <li key={name}>{value}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2>Size + Fit</h2>
        {fit.length > 0 && (
          <ul>
            {fit.map(({ name, value }) => (
              <li key={name}>{value}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
