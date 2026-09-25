import { useBrand } from '../../brands/context';
import { Link } from '../../app/router';
import { ProductImage } from '../../components/ProductImage';
import { useCatalog } from '../catalog/CatalogProvider';
import { InlineError, LoadingCards } from '../../components/Primitives';
import { ProductGrid } from '../catalog/Products';
import { GarnetHillHome } from '../../brands/garnet-hill/Home';

export function Home() {
  const brand = useBrand();
  return brand.home.layout === 'editorial' ? (
    <GarnetHillHome />
  ) : (
    <ClassicHome />
  );
}

function ClassicHome() {
  const brand = useBrand();
  const { products, categories, loading, error, reload } = useCatalog();
  const heroProduct = products.find((product) =>
    product.variants.some((variant) => variant.images.length),
  );
  const heroImage = heroProduct?.variants.find(
    (variant) => variant.images.length,
  )?.images[0];
  const roots = categories.filter(
    (category) =>
      !category.parentId ||
      !categories.some((parent) => parent.id === category.parentId),
  );
  return (
    <>
      <section className={`home-hero ${!heroImage ? 'without-image' : ''}`}>
        {heroImage && (
          <img
            className="hero-photograph"
            src={heroImage}
            alt={heroProduct!.name}
            fetchPriority="high"
          />
        )}
        <div className="hero-copy">
          <p className="eyebrow">{brand.home.eyebrow}</p>
          <h1>{brand.home.headline}</h1>
          <p>{brand.home.description}</p>
          <Link
            className="button light"
            href={`${brand.route}/category/all-products`}
          >
            {brand.home.cta}
          </Link>
        </div>
      </section>
      <div className="editorial-intro">
        <p className="eyebrow">{brand.displayName}</p>
        <h2>{brand.home.secondaryTitle}</h2>
      </div>
      {roots.length > 0 && (
        <section
          className="page-width category-stories"
          aria-label="Shop by category"
        >
          {roots.slice(0, 3).map((category) => {
            const product = products.find(
              (item) =>
                item.categories.some((entry) => entry.id === category.id) &&
                item.variants[0]?.images.length,
            );
            return (
              <Link
                key={category.id}
                href={`${brand.route}/category/${encodeURIComponent(category.slug)}`}
              >
                <div>
                  <ProductImage
                    src={product?.variants[0]?.images[0]}
                    name={category.name}
                  />
                </div>
                <h2>{category.name}</h2>
                <span className="text-link">Explore the collection</span>
              </Link>
            );
          })}
        </section>
      )}
      <section className="page-width section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FROM OUR COLLECTION</p>
            <h2>Find your next favorite.</h2>
          </div>
          <Link
            className="text-link"
            href={`${brand.route}/category/all-products`}
          >
            Shop All Products →
          </Link>
        </div>
        {loading ? (
          <LoadingCards />
        ) : error ? (
          <InlineError message={error} retry={reload} />
        ) : products.length ? (
          <ProductGrid products={products.slice(0, 8)} />
        ) : (
          <div className="empty-state">
            <h2>Our collection is on its way.</h2>
            <p>There are no published products available in this store yet.</p>
            <button className="button secondary" onClick={reload}>
              Refresh Collection
            </button>
          </div>
        )}
      </section>
    </>
  );
}
