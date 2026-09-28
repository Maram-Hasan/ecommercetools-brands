import { useState } from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../../containers/app/router';
import { ProductImage } from '../product-image/index';
import { ProductBadges } from '../product-badges';
import type { ShopProduct } from '../../models/product';
import { Price } from '../price';
import { Modal } from '../primitives/index';
import { formatPrice } from '../../utils/money';

export function ProductCard({ product }: { product: ShopProduct }) {
  const brand = useBrand();
  const [selected, setSelected] = useState(0);
  const [quick, setQuick] = useState(false);
  const variant = product.variants[selected] ?? product.variants[0];
  const href = `${brand.route}/product/${encodeURIComponent(product.slug)}`;
  const faceted = brand.catalog.layout === 'faceted';
  const detailedCard = faceted || brand.catalog.layout === 'refined';
  const swatches = product.variants.filter(
    (item) => item.swatchColor || item.swatchImage || item.swatch,
  );
  const prices = product.variants.flatMap((item) =>
    item.price ? [item.price] : [],
  );
  const low = prices.reduce(
    (current, item) => (item.amount < current.amount ? item : current),
    prices[0],
  );
  const high = prices.reduce(
    (current, item) => (item.amount > current.amount ? item : current),
    prices[0],
  );
  const cardPrice =
    low && high && low.amount !== high.amount
      ? `${formatPrice(low)} - ${formatPrice(high)}`
      : null;
  const cardSwatches = swatches.length ? (
    <div className="card-swatches" aria-label="Available finishes">
      {swatches.slice(0, 6).map((item) => {
        const index = product.variants.indexOf(item);
        return (
          <button
            key={item.id}
            style={{
              background: item.swatchColor || item.swatch,
              ...(item.swatchImage
                ? { backgroundImage: `url("${item.swatchImage}")` }
                : {}),
            }}
            aria-label={`${product.name}: ${item.label}`}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
          />
        );
      })}
      {swatches.length > 6 && (
        <span className="more-swatches">+{swatches.length - 6} more</span>
      )}
    </div>
  ) : null;
  return (
    <article className="shop-product-card">
      <div className="card-visual">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ProductImage src={variant?.images[0]} name={product.name} />
        </Link>
        {!detailedCard && (
          <ProductBadges badges={product.badges} className="card-badges" />
        )}
        {brand.features.quickShop && (
          <button className="quick-shop" onClick={() => setQuick(true)}>
            Quick View
          </button>
        )}
      </div>
      {detailedCard && (
        <ProductBadges badges={product.badges} className="card-badges" />
      )}
      <div className="card-content">
        {detailedCard && cardSwatches}
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
        {cardPrice ? (
          <div className="shop-price">{cardPrice}</div>
        ) : (
          variant && <Price variant={variant} />
        )}
        {!detailedCard && brand.features.swatchesOnCards && cardSwatches}
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
