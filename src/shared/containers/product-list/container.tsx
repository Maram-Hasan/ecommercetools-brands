import { useMemo, useState } from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { useCatalog } from '../../store/catalog/provider';
import {
  Breadcrumbs,
  InlineError,
  LoadingCards,
} from '../../components/primitives/index';
import { ProductGrid } from '../../components/product-card/index';

export function Category({ slug, search }: { slug: string; search: string }) {
  const brand = useBrand();
  const { products, categories, loading, error, reload } = useCatalog();
  const query = new URLSearchParams(search).get('q') ?? '';
  const category = categories.find(
    (item) => item.slug === slug || item.id === slug,
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [price, setPrice] = useState('all');
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 24;
  const currency =
    products.find((product) => product.variants[0]?.price)?.variants[0]?.price
      ?.currencyCode ?? 'USD';
  const threshold = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(500);
  const title = query
    ? `Search results for “${query}”`
    : slug === 'all-products'
      ? brand.catalog.title
      : category?.name || 'Collection';
  const scoped = useMemo(
    () =>
      products.filter(
        (product) =>
          (slug === 'all-products' ||
            product.categories.some((item) => item.id === category?.id)) &&
          (!query ||
            `${product.name} ${product.description} ${product.variants.map((variant) => variant.sku).join(' ')}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [products, slug, category, query],
  );
  const availableCategories = categories.filter((item) =>
    scoped.some((product) =>
      product.categories.some((entry) => entry.id === item.id),
    ),
  );
  const filtered = useMemo(() => {
    const result = scoped.filter((product) => {
      const value = product.variants[0]?.price;
      const amount = value
        ? value.amount / 10 ** value.fractionDigits
        : Infinity;
      return (
        (!selectedCategories.length ||
          product.categories.some((item) =>
            selectedCategories.includes(item.id),
          )) &&
        (price === 'all' ||
          (!!value && (price === 'under500' ? amount < 500 : amount >= 500))) &&
        (!saleOnly || !!product.variants[0]?.originalPrice)
      );
    });
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'low' || sort === 'high')
      result.sort((a, b) => {
        const first = a.variants[0]?.price;
        const second = b.variants[0]?.price;
        if (!first) return second ? 1 : 0;
        if (!second) return -1;
        const difference =
          first.amount / 10 ** first.fractionDigits -
          second.amount / 10 ** second.fractionDigits;
        return sort === 'low' ? difference : -difference;
      });
    return result;
  }, [scoped, selectedCategories, price, saleOnly, sort]);
  const pageOffset = Math.min(
    offset,
    Math.max(0, Math.ceil(filtered.length / limit) - 1) * limit,
  );
  const page = filtered.slice(pageOffset, pageOffset + limit);
  function reset() {
    setSelectedCategories([]);
    setPrice('all');
    setSaleOnly(false);
    setOffset(0);
  }
  return (
    <div className="page-width category-page">
      <Breadcrumbs items={[{ label: title }]} />
      <div className="category-intro without-image">
        <div>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="catalog-layout">
        <aside className={`filters ${filtersOpen ? 'is-open' : ''}`}>
          <div className="filter-heading">
            <h2>Filter By</h2>
            <button className="text-button" onClick={reset}>
              Clear all
            </button>
          </div>
          {availableCategories.length > 0 && (
            <details open>
              <summary>Category</summary>
              {availableCategories.map((item) => (
                <label className="check-row" key={item.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(item.id)}
                    onChange={() => {
                      setOffset(0);
                      setSelectedCategories((old) =>
                        old.includes(item.id)
                          ? old.filter((id) => id !== item.id)
                          : [...old, item.id],
                      );
                    }}
                  />
                  {item.name}
                </label>
              ))}
            </details>
          )}
          <details open>
            <summary>Price</summary>
            {[
              ['all', 'All prices'],
              ['under500', `Under ${threshold}`],
              ['over500', `${threshold} and over`],
            ].map(([value, label]) => (
              <label className="check-row" key={value}>
                <input
                  type="radio"
                  name="price"
                  checked={price === value}
                  onChange={() => {
                    setPrice(value);
                    setOffset(0);
                  }}
                />
                {label}
              </label>
            ))}
          </details>
          {scoped.some((product) => product.variants[0]?.originalPrice) && (
            <details open>
              <summary>Special Offers</summary>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(event) => {
                    setSaleOnly(event.target.checked);
                    setOffset(0);
                  }}
                />
                On sale
              </label>
            </details>
          )}
        </aside>
        <section className="catalog-results" aria-label="Products">
          <div className="catalog-toolbar">
            <button
              className="filter-toggle button secondary"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Filters {filtersOpen ? '−' : '+'}
            </button>
            <span>
              {loading
                ? 'Finding your favorites…'
                : `${filtered.length} products`}
            </span>
            <label>
              Sort by{' '}
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setOffset(0);
                }}
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
            <button className="text-button" onClick={reload} disabled={loading}>
              Refresh
            </button>
          </div>
          {loading ? (
            <LoadingCards />
          ) : error ? (
            <InlineError message={error} retry={reload} />
          ) : page.length ? (
            <ProductGrid products={page} />
          ) : (
            <div className="empty-state">
              <h2>
                {products.length
                  ? 'No matches just yet.'
                  : 'Our collection is on its way.'}
              </h2>
              <p>
                {products.length
                  ? 'Try another search or adjust your filters.'
                  : 'There are no published products available in this store yet.'}
              </p>
              <button className="button secondary" onClick={reset}>
                Clear Filters
              </button>
              <Link
                className="text-link"
                href={`${brand.route}/category/all-products`}
              >
                All Products
              </Link>
            </div>
          )}
          {!loading && !error && filtered.length > limit && (
            <div className="catalog-pagination">
              <button
                className="button secondary"
                disabled={pageOffset === 0}
                onClick={() => setOffset(Math.max(0, pageOffset - limit))}
              >
                Previous
              </button>
              <span>
                Page {Math.floor(pageOffset / limit) + 1} of{' '}
                {Math.ceil(filtered.length / limit)}
              </span>
              <button
                className="button secondary"
                disabled={pageOffset + limit >= filtered.length}
                onClick={() => setOffset(pageOffset + limit)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
