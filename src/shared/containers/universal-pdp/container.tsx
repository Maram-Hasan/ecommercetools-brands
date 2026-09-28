import { useEffect, useState } from 'react';
import { useBrandComponents } from '../app/composition';
import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { Breadcrumbs, InlineError } from '../../components/primitives/index';
import { categoryTrail, galleryImages } from '../../models/product-options';
import { ProductInfo } from './partials/ProductInfo';
import { useProduct } from './useProduct';

function ProductDetailsSkeleton() {
  return (
    <div
      className="page-width pdp-page pdp-skeleton"
      role="status"
      aria-label="Loading product details"
    >
      <span className="sr-only">Loading product details</span>
      <div
        className="loading-surface pdp-skeleton-breadcrumb"
        aria-hidden="true"
      />
      <div className="pdp-layout" aria-hidden="true">
        <div className="product-gallery pdp-skeleton-gallery">
          <div className="pdp-skeleton-thumbnails">
            {Array.from({ length: 4 }, (_, index) => (
              <span className="loading-surface" key={index} />
            ))}
          </div>
          <div className="loading-surface pdp-skeleton-image" />
        </div>
        <div className="product-info-panel pdp-skeleton-info">
          <div className="loading-surface pdp-skeleton-line title" />
          <div className="loading-surface pdp-skeleton-line meta" />
          <div className="loading-surface pdp-skeleton-line price" />
          <div className="loading-surface pdp-skeleton-option" />
          <div className="loading-surface pdp-skeleton-option compact" />
          <div className="pdp-skeleton-purchase">
            <div className="loading-surface" />
            <div className="loading-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetails({ slug }: { slug: string }) {
  const [smallScreen, setSmallScreen] = useState(
    () => window.matchMedia('(max-width: 700px)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const update = () => setSmallScreen(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const brand = useBrand();
  const { ProductDetailsContent, ProductGallery } = useBrandComponents();
  const { product, selected, setSelected, error, retry } = useProduct(slug);
  if (error)
    return (
      <div className="page-width section-space">
        <InlineError message={error} retry={retry} />
        <Link
          href={`${brand.route}/category/${brand.home.category}`}
          className="text-link"
        >
          Back to collection
        </Link>
      </div>
    );
  if (!product) return <ProductDetailsSkeleton />;
  const variant =
    product.variants.find((v) => v.id === selected) ?? product.variants[0];
  const gallery = (
    <ProductGallery
      key={`${product.id}-${selected}`}
      images={galleryImages(product, variant)}
      name={product.name}
    />
  );
  return (
    <div className="page-width pdp-page">
      <Breadcrumbs
        mobileParent
        items={[
          ...categoryTrail(product).map((category) => ({
            label: category.name,
            href: `${brand.route}/category/${encodeURIComponent(category.slug)}`,
          })),
          { label: product.name },
        ]}
      />
      <div className="pdp-layout">
        {!smallScreen && gallery}
        <ProductInfo
          key={product.id}
          product={product}
          selected={selected}
          onSelect={setSelected}
          mobileGallery={smallScreen ? gallery : undefined}
        />
      </div>
      <ProductDetailsContent product={product} />
    </div>
  );
}
