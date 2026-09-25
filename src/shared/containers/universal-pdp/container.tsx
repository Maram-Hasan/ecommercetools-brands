import { productSections } from './parsers';
import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { Breadcrumbs, InlineError } from '../../components/primitives/index';
import { categoryTrail, galleryImages } from '../../models/product-options';
import { ProductGallery } from './partials/ProductGallery';
import { ProductInfo } from './partials/ProductInfo';
import { useProduct } from './useProduct';
export function ProductDetails({ slug }: { slug: string }) {
  const brand = useBrand();
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
  if (!product)
    return (
      <div className="page-width section-space" role="status">
        Loading your next favorite…
      </div>
    );
  const variant =
    product.variants.find((v) => v.id === selected) ?? product.variants[0];
  return (
    <div className="page-width pdp-page">
      <Breadcrumbs
        separator=">"
        items={[
          ...categoryTrail(product).map((category) => ({
            label: category.name,
            href: `${brand.route}/category/${encodeURIComponent(category.slug)}`,
          })),
          { label: product.name },
        ]}
      />
      <div className="pdp-layout">
        <ProductGallery
          key={`${product.id}-${selected}`}
          images={galleryImages(product, variant)}
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
        {productSections(product.description).map((detail, index) => (
          <details key={detail.title} open={index === 0}>
            <summary>{detail.title}</summary>
            <p>{detail.content}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
