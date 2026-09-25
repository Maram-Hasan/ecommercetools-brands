import { useState } from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../../containers/app/router';
import { ProductImage } from '../product-image/index';
import type { ShopProduct } from '../../models/product';
import { Price } from '../price';
import { Modal } from '../primitives/index';

export function ProductCard({ product }: { product: ShopProduct }) {
  const brand = useBrand();
  const [selected, setSelected] = useState(0);
  const [quick, setQuick] = useState(false);
  const variant = product.variants[selected] ?? product.variants[0];
  const href = `${brand.route}/product/${encodeURIComponent(product.slug)}`;
  return (
    <article className="shop-product-card">
      <div className="card-visual">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage src={variant?.images[0]} name={product.name} />
        </Link>
        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}
        {brand.features.quickShop && (
          <button className="quick-shop" onClick={() => setQuick(true)}>
            Quick View
          </button>
        )}
      </div>
      <div className="card-content">
        <Link href={href}>
          <h3>{product.name}</h3>
        </Link>
        {product.rating && (
          <div
            className="rating"
            aria-label={`${product.rating} out of 5 stars, ${product.reviewCount} reviews`}
          >
            <span aria-hidden="true">★★★★★</span>
            <small>({product.reviewCount})</small>
          </div>
        )}
        {variant && <Price variant={variant} />}
        {brand.features.swatchesOnCards && variant?.swatch && (
          <div className="card-swatches" aria-label="Available finishes">
            {product.variants.map((v, index) => (
              <button
                key={v.id}
                style={{ background: v.swatch }}
                aria-label={`${product.name}: ${v.label}`}
                aria-pressed={index === selected}
                onClick={() => setSelected(index)}
              />
            ))}
          </div>
        )}
      </div>
      {quick && (
        <Modal title="A closer look" onClose={() => setQuick(false)}>
          <div className="quick-view-content">
            <ProductImage src={variant?.images[0]} name={product.name} />
            <div>
              <p className="eyebrow">{product.category}</p>
              <h2>{product.name}</h2>
              {variant && <Price variant={variant} />}
              <p>{product.description}</p>
              <Link
                className="button full"
                href={href}
                onClick={() => setQuick(false)}
              >
                Choose Options
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </article>
  );
}

export function ProductGrid({ products }: { products: ShopProduct[] }) {
  return (
    <div className="shop-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
