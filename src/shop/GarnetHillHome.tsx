import { Link, useBrand } from '../brands/context';
import { ProductImage } from '../components';
import { useCatalog } from './CatalogContext';
import { InlineError, LoadingCards } from './Primitives';
import { ProductGrid } from './Products';

export function GarnetHillHome() {
  const brand = useBrand();
  const { products, categories, loading, error, reload } = useCatalog();
  const illustrated = products.filter((product) =>
    product.variants.some((variant) => variant.images.length),
  );
  const hero =
    brand.home.preferredCategories?.flatMap((name) =>
      illustrated.filter((product) =>
        product.categories.some(
          (category) => category.name.toLowerCase() === name.toLowerCase(),
        ),
      ),
    )[0] ?? illustrated[0];
  const image = hero?.variants.find((variant) => variant.images.length)
    ?.images[0];
  const roots = categories.filter(
    (category) =>
      !category.parentId ||
      !categories.some((parent) => parent.id === category.parentId),
  );
  const stories = roots
    .map((category) => ({
      category,
      product: illustrated.find((product) =>
        product.categories.some((entry) => entry.id === category.id),
      ),
    }))
    .filter((story) => story.product);
  return (
    <div className="gh-home">
      <section className={`home-hero ${!image ? 'without-image' : ''}`}>
        {image && (
          <img
            className="hero-photograph"
            src={image}
            alt={hero!.name}
            fetchPriority="high"
          />
        )}
        <div className="hero-copy">
          <p className="eyebrow">{brand.home.eyebrow}</p>
          <h1>{brand.home.headline}</h1>
          <p>{brand.home.description}</p>
          <Link
            className="button"
            href={`${brand.route}/category/${brand.home.category}`}
          >
            {brand.home.cta}
          </Link>
        </div>
      </section>
      {!!stories.length && (
        <section
          className="gh-category-section page-width"
          aria-label="Shop by category"
        >
          <h2>{brand.home.secondaryTitle}</h2>
          <div className="gh-category-grid">
            {stories.slice(0, 6).map(({ category, product }) => (
              <Link
                key={category.id}
                href={`${brand.route}/category/${encodeURIComponent(category.slug)}`}
              >
                <div>
                  <ProductImage
                    src={
                      product?.variants.find((variant) => variant.images.length)
                        ?.images[0]
                    }
                    name={category.name}
                  />
                </div>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
      {illustrated.length > 1 && (
        <section
          className="gh-editorial-stories page-width"
          aria-label="Collection highlights"
        >
          {illustrated
            .filter((product) => product.id !== hero?.id)
            .slice(0, 2)
            .map((product) => (
              <Link
                key={product.id}
                href={`${brand.route}/product/${product.slug}`}
              >
                <div className="gh-story-image">
                  <ProductImage
                    src={
                      product.variants.find((variant) => variant.images.length)
                        ?.images[0]
                    }
                    name={product.name}
                  />
                </div>
                <h2>{product.name}</h2>
                <span className="text-link">Explore now</span>
              </Link>
            ))}
        </section>
      )}
      <section className="page-width section-space gh-featured-products">
        <div className="section-heading">
          <h2>Discover the collection</h2>
          <Link
            className="text-link"
            href={`${brand.route}/category/all-products`}
          >
            Shop All Products
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
    </div>
  );
}
