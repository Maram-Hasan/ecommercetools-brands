import { useEffect, useState } from 'react';
import { Link, useBrand } from '../brands/context';
import { ProductImage } from '../components';
import { commerce } from '../services/commerce';
import type { ShopProduct, ShopVariant } from '../services/models';
import { useCatalog } from './CatalogContext';
import {
  Breadcrumbs,
  Icon,
  InlineError,
  Modal,
  QuantitySelector,
} from './Primitives';
import { Price, ProductGrid } from './Products';
import { useCart } from './CartContext';
import { ProductionProductInfo } from './ProductPurchase';
import { FrontgateProductInfo } from './FrontgateProductInfo';
import { categoryTrail, galleryImages } from '../services/product-options';

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const brand = useBrand();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="product-gallery" data-gallery={brand.gallery}>
      <div className="gallery-thumbnails">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            className={index === i ? 'selected' : ''}
            aria-label={`View image ${i + 1}`}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <img src={src} alt={`${name}, view ${i + 1}`} />
          </button>
        ))}
      </div>
      <div className="gallery-main">
        <button
          className="gallery-zoom"
          aria-label="Enlarge product image"
          disabled={!images.length}
          onClick={() => setZoom(true)}
        >
          <div className="gallery-image">
            <ProductImage src={images[index] ?? images[0]} name={name} eager />
          </div>
          <span>＋ View larger</span>
        </button>
        <p>
          {images.length > 1
            ? `${index + 1} / ${images.length}`
            : 'Product view'}
        </p>
      </div>
      {zoom && (
        <Modal title={name} onClose={() => setZoom(false)}>
          <div className="zoom-image">
            <ProductImage src={images[index]} name={name} />
          </div>
        </Modal>
      )}
    </div>
  );
}

export function VariantSelector({
  variants,
  selected,
  onChange,
}: {
  variants: ShopVariant[];
  selected: number;
  onChange: (id: number) => void;
}) {
  const variant = variants.find((v) => v.id === selected);
  return (
    <fieldset className="variant-selector">
      <legend>
        {variant?.swatch ? 'Finish' : 'Option'}:{' '}
        <strong>{variant?.label}</strong>
      </legend>
      {variant?.swatch ? (
        <div className="variant-swatches">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              className={v.id === selected ? 'selected' : ''}
              aria-label={v.label}
              aria-pressed={v.id === selected}
              onClick={() => onChange(v.id)}
            >
              <span style={{ background: v.swatch }} />
            </button>
          ))}
        </div>
      ) : (
        <select
          aria-label="Product option"
          value={selected}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {variants.map((v) => (
            <option value={v.id} key={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      )}
    </fieldset>
  );
}

export function ProductInfo({
  product,
  selected,
  onSelect,
}: {
  product: ShopProduct;
  selected: number;
  onSelect: (id: number) => void;
}) {
  const brand = useBrand();
  return brand.pdp?.layout === 'frontgate' ||
    brand.pdp?.layout === 'garnet-hill' ? (
    <FrontgateProductInfo
      product={product}
      selected={selected}
      onSelect={onSelect}
    />
  ) : brand.pdp ? (
    <ProductionProductInfo
      product={product}
      selected={selected}
      onSelect={onSelect}
    />
  ) : (
    <ClassicProductInfo
      product={product}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

function ClassicProductInfo({
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
    product.variants.find((v) => v.id === selected) ?? product.variants[0];
  return (
    <section className="product-info-panel">
      {product.badge && <p className="eyebrow">{product.badge}</p>}
      <h1>{product.name}</h1>
      <p className="sku">Item #{variant?.sku || product.id}</p>

      {variant && <Price variant={variant} />}
      {variant && (
        <VariantSelector
          variants={product.variants}
          selected={variant.id}
          onChange={onSelect}
        />
      )}

      <div className="availability">
        <span className={variant?.price ? 'available-dot' : ''} />
        {variant?.price
          ? 'Price available · delivery confirmed later'
          : 'Price unavailable for this option'}
      </div>
      <div className="purchase-controls">
        <label>
          <span>Quantity</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            disabled={busy}
          />
        </label>
        <button
          className="button add-to-bag"
          disabled={busy || !variant?.price}
          onClick={() => {
            if (variant) void add(product, variant.id, quantity);
          }}
        >
          {busy ? 'Adding…' : 'Add to Bag'}
        </button>
      </div>
      {error && <InlineError message={error} />}
      <div className="delivery-note">
        <Icon name="truck" />
        <div>
          <strong>Thoughtful service, every step.</strong>
          <p>Explore delivery options at checkout.</p>
          <small>Demo checkout · no payment or shipment.</small>
        </div>
      </div>
      {!!variant?.attributes?.length && (
        <details className="product-specifications">
          <summary>Product Specifications</summary>
          <dl className="variant-attributes">
            {variant.attributes.map((attribute) => (
              <div key={attribute.name} style={{ display: 'contents' }}>
                <dt>{attribute.name.replace(/[-_]/g, ' ')}</dt>
                <dd>{attribute.value}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
}

export function ProductDetails({ slug }: { slug: string }) {
  const brand = useBrand();
  const catalog = useCatalog();
  const [product, setProduct] = useState<ShopProduct>();
  const [selected, setSelected] = useState(1);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setProduct(undefined);
    setError('');
    commerce
      .product(brand, slug, controller.signal)
      .then((p) => {
        if (!controller.signal.aborted) {
          setProduct(p);
          setSelected(p.variants[0]?.id ?? 1);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [brand, slug, revision]);
  if (error)
    return (
      <div className="page-width section-space">
        <InlineError message={error} retry={() => setRevision((v) => v + 1)} />
        <Link
          href={`${brand.route}/category/${brand.home.category}`}
          className="text-link"
        >
          Back to collection
        </Link>
      </div>
    );
  if (!product)
    return (
      <div className="page-width section-space" role="status">
        Loading your next favorite…
      </div>
    );
  const variant =
    product.variants.find((v) => v.id === selected) ?? product.variants[0];
  return (
    <div className="page-width pdp-page" data-pdp={brand.pdp?.layout}>
      <Breadcrumbs
        separator={brand.pdp ? '>' : '/'}
        items={[
          ...(brand.pdp
            ? categoryTrail(product).map((category) => ({
                label: category.name,
                href: `${brand.route}/category/${encodeURIComponent(category.slug)}`,
              }))
            : [
                {
                  label: product.category,
                  href: `${brand.route}/category/${encodeURIComponent(product.categories.at(-1)?.slug || 'all-products')}`,
                },
              ]),
          { label: product.name },
        ]}
      />
      <div className="pdp-layout">
        <ProductGallery
          key={`${product.id}-${selected}`}
          images={
            brand.pdp
              ? galleryImages(product, variant)
              : (variant?.images ?? [])
          }
          name={product.name}
        />
        <ProductInfo
          key={product.id}
          product={product}
          selected={selected}
          onSelect={setSelected}
        />
      </div>
      <section className="product-details-sections" id="product-details">
        {product.details.map((detail, index) => (
          <details key={detail.title} open={index === 0}>
            <summary>{detail.title}</summary>
            <p>{detail.content}</p>
          </details>
        ))}
        {!brand.pdp && (
          <details>
            <summary>Customer Reviews</summary>
            <p>Customer reviews are not available yet.</p>
          </details>
        )}
      </section>
      {!brand.pdp && (
        <section className="section-space">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE FINISHING TOUCHES</p>
              <h2>You may also love</h2>
            </div>
          </div>
          <ProductGrid
            products={catalog.products
              .filter((p) => p.id !== product.id)
              .slice(0, 4)}
          />
        </section>
      )}
    </div>
  );
}
