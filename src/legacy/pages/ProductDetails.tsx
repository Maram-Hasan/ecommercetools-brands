import { useState } from 'react';
import type { Product } from '../../../shared/domain/product';
import { useResource } from '../useResource';
import { useStorefront } from '../storefront';
import { BagIcon } from '../components';
import { ErrorState } from '../components';
import { formatPrice } from '../../shared/utils/money';
import { Loading } from '../components';
import { ProductImage } from '../../shared/components/product-image/index';

interface Props {
  id: string;
  busy: boolean;
  addToCart: (
    productId: string,
    variantId: number,
    quantity: number,
  ) => Promise<void>;
}

export function ProductDetails({ id, busy, addToCart }: Props) {
  const store = useStorefront();
  const {
    data: product,
    loading,
    error,
    reload,
  } = useResource<Product>(`/products/${id}`);
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  if (loading) return <Loading />;
  if (error || !product)
    return (
      <ErrorState message={error || 'Product not found.'} retry={reload} />
    );
  const variant = product.variants[variantIndex];

  return (
    <section className="detail-page">
      <a className="back-link" href="#/">
        ← Back to collection
      </a>
      <div className="detail-grid">
        <div>
          <div className="detail-image">
            <ProductImage
              src={variant?.images[imageIndex]}
              name={product.name}
              eager
            />
          </div>
          {variant?.images.length > 1 && (
            <div className="thumbnails">
              {variant.images.map((image, index) => (
                <button
                  className={index === imageIndex ? 'selected' : ''}
                  key={image}
                  onClick={() => setImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === imageIndex}
                >
                  <ProductImage src={image} name={product.name} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <p className="eyebrow">{store.name.toUpperCase()}</p>
          <h1>{product.name}</h1>
          <p className="product-code">
            {variant?.sku
              ? `SKU: ${variant.sku}`
              : `Product: ${product.key || product.id}`}
          </p>
          <p className="detail-price">{formatPrice(variant?.price)}</p>
          {product.description && (
            <p className="description">{product.description}</p>
          )}
          {product.variants.length > 1 && (
            <label className="field-label">
              Choose a variant
              <select
                value={variantIndex}
                onChange={(event) => {
                  setVariantIndex(Number(event.target.value));
                  setImageIndex(0);
                }}
              >
                {product.variants.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.sku || `Variant ${item.id}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="purchase-row">
            <label className="field-label">
              Quantity
              <select
                value={quantity}
                disabled={busy}
                onChange={(event) => setQuantity(Number(event.target.value))}
              >
                {Array.from({ length: 10 }, (_, index) => (
                  <option key={index + 1}>{index + 1}</option>
                ))}
              </select>
            </label>
            <button
              className="button add-button"
              disabled={busy || !variant?.price}
              onClick={() => void addToCart(product.id, variant.id, quantity)}
            >
              <BagIcon />
              {busy ? 'Please wait…' : 'Add to bag'}
            </button>
          </div>
          {!variant?.price && (
            <p className="availability-note">
              This variant is currently unavailable to purchase in this market.
            </p>
          )}
          <div className="detail-note">
            <span aria-hidden="true">◇</span> A new favorite, one small detail
            at a time.
          </div>
        </div>
      </div>
    </section>
  );
}
