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
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minimumPrice, setMinimumPrice] = useState<number | null>(null);
  const [maximumPrice, setMaximumPrice] = useState<number | null>(null);
  const [saleOnly, setSaleOnly] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({});
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>(
    {},
  );
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 24;
  const faceted = brand.catalog.layout === 'faceted';
  const refined = brand.catalog.layout === 'refined';
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
  const priceExtent = useMemo(() => {
    const amounts = scoped.flatMap((product) =>
      product.variants.flatMap((variant) =>
        variant.price
          ? [variant.price.amount / 10 ** variant.price.fractionDigits]
          : [],
      ),
    );
    return {
      minimum: amounts.length ? Math.floor(Math.min(...amounts)) : 0,
      maximum: amounts.length ? Math.ceil(Math.max(...amounts)) : 0,
    };
  }, [scoped]);
  const attributeFacets = useMemo(() => {
    const supported = new Map([
      ['size', 'Size'],
      ['color', 'Color'],
      ['colour', 'Color'],
      ['material', 'Material'],
    ]);
    const groups = new Map<string, Map<string, number>>();
    for (const product of scoped) {
      const productValues = new Map<string, Set<string>>();
      for (const variant of product.variants)
        for (const attribute of variant.attributes ?? []) {
          const key = attribute.name.toLowerCase().replace(/[^a-z]/g, '');
          const label = supported.get(key);
          if (!label) continue;
          if (!productValues.has(label)) productValues.set(label, new Set());
          productValues.get(label)!.add(attribute.value);
        }
      for (const [label, values] of productValues) {
        if (!groups.has(label)) groups.set(label, new Map());
        for (const value of values)
          groups
            .get(label)!
            .set(value, (groups.get(label)!.get(value) ?? 0) + 1);
      }
    }
    return ['Size', 'Color', 'Material'].flatMap((name) => {
      const values = groups.get(name);
      return values
        ? [
            {
              name,
              values: [...values].map(([value, count]) => ({
                value,
                count,
                swatch:
                  name === 'Color'
                    ? scoped
                        .flatMap((product) => product.variants)
                        .find((variant) =>
                          (variant.attributes ?? []).some(
                            (attribute) =>
                              ['color', 'colour'].includes(
                                attribute.name
                                  .toLowerCase()
                                  .replace(/[^a-z]/g, ''),
                              ) && attribute.value === value,
                          ),
                        )?.swatchColor
                    : undefined,
              })),
            },
          ]
        : [];
    });
  }, [scoped]);
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
        (!saleOnly || !!product.variants[0]?.originalPrice) &&
        (!inStockOnly ||
          product.variants.some((variant) => variant.available === true)) &&
        (!refined ||
          product.variants.some((variant) => {
            if (!variant.price) return false;
            const variantAmount =
              variant.price.amount / 10 ** variant.price.fractionDigits;
            return (
              variantAmount >= (minimumPrice ?? priceExtent.minimum) &&
              variantAmount <= (maximumPrice ?? priceExtent.maximum)
            );
          })) &&
        Object.entries(selectedAttributes).every(
          ([name, values]) =>
            !values.length ||
            product.variants.some((variant) =>
              (variant.attributes ?? []).some((attribute) => {
                const attributeName = attribute.name
                  .toLowerCase()
                  .replace(/[^a-z]/g, '');
                return (
                  (attributeName === 'colour' ? 'color' : attributeName) ===
                    name && values.includes(attribute.value)
                );
              }),
            ),
        )
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
  }, [
    scoped,
    selectedCategories,
    price,
    saleOnly,
    inStockOnly,
    refined,
    minimumPrice,
    maximumPrice,
    priceExtent,
    selectedAttributes,
    sort,
  ]);
  const pageOffset = Math.min(
    offset,
    Math.max(0, Math.ceil(filtered.length / limit) - 1) * limit,
  );
  const page = filtered.slice(pageOffset, pageOffset + limit);
  function reset() {
    setSelectedCategories([]);
    setPrice('all');
    setSaleOnly(false);
    setInStockOnly(false);
    setMinimumPrice(null);
    setMaximumPrice(null);
    setSelectedAttributes({});
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
          {refined && (
            <>
              <div className="filter-heading gr-filter-heading">
                <h2>☷&nbsp; Filter By:</h2>
                <button className="text-button" onClick={reset}>
                  Clear all
                </button>
              </div>
              <div className="gr-stock-filter">
                <label>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(event) => {
                      setInStockOnly(event.target.checked);
                      setOffset(0);
                    }}
                  />
                  <span aria-hidden="true" />
                  In-Stock
                </label>
                <small>Ships in 1-7 Business Days</small>
              </div>
              {availableCategories.length > 0 && (
                <details open className="gr-catalog-filter">
                  <summary>Type</summary>
                  {availableCategories
                    .slice(0, expandedFacets.Type ? undefined : 4)
                    .map((item) => (
                      <label className="check-row" key={item.id}>
                        <input
                          type="checkbox"
                          aria-label={item.name}
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
                        {item.name} (
                        {
                          scoped.filter((product) =>
                            product.categories.some(
                              (entry) => entry.id === item.id,
                            ),
                          ).length
                        }
                        )
                      </label>
                    ))}
                  {availableCategories.length > 4 && (
                    <button
                      className="text-button gr-show-more"
                      onClick={() =>
                        setExpandedFacets((old) => ({
                          ...old,
                          Type: !old.Type,
                        }))
                      }
                    >
                      {expandedFacets.Type ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </details>
              )}
              <details open className="gr-catalog-filter gr-price-filter">
                <summary>Price</summary>
                <div className="gr-price-range">
                  <input
                    type="range"
                    aria-label="Minimum price"
                    min={priceExtent.minimum}
                    max={priceExtent.maximum}
                    value={minimumPrice ?? priceExtent.minimum}
                    onChange={(event) => {
                      setMinimumPrice(
                        Math.min(
                          Number(event.target.value),
                          maximumPrice ?? priceExtent.maximum,
                        ),
                      );
                      setOffset(0);
                    }}
                  />
                  <input
                    type="range"
                    aria-label="Maximum price"
                    min={priceExtent.minimum}
                    max={priceExtent.maximum}
                    value={maximumPrice ?? priceExtent.maximum}
                    onChange={(event) => {
                      setMaximumPrice(
                        Math.max(
                          Number(event.target.value),
                          minimumPrice ?? priceExtent.minimum,
                        ),
                      );
                      setOffset(0);
                    }}
                  />
                </div>
                <div className="gr-price-values">
                  <span>${minimumPrice ?? priceExtent.minimum}</span>
                  <span>${maximumPrice ?? priceExtent.maximum}</span>
                </div>
              </details>
              <div className="gr-help-card">How can we help?</div>
            </>
          )}
          {faceted && (
            <div className="gh-departments">
              {availableCategories.map((item) => (
                <details key={item.id}>
                  <summary>{item.name}</summary>
                  <label className="check-row">
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
                </details>
              ))}
            </div>
          )}
          {!refined && (
            <div className="filter-heading">
              <h2>{faceted ? '☷  Filter By:' : 'Filter By'}</h2>
              <button className="text-button" onClick={reset}>
                Clear all
              </button>
            </div>
          )}
          {!faceted && !refined && availableCategories.length > 0 && (
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
          {!faceted && !refined && (
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
          )}
          {faceted &&
            attributeFacets.map((facet) => (
              <details open className="gh-attribute-filter" key={facet.name}>
                <summary>
                  <span className="gh-attribute-filter__Name">
                    {facet.name}
                  </span>
                </summary>
                {facet.values
                  .slice(0, expandedFacets[facet.name] ? undefined : 5)
                  .map(({ value, count, swatch }) => {
                    const key = facet.name.toLowerCase();
                    const values = selectedAttributes[key] ?? [];
                    return (
                      <label className="check-row" key={value}>
                        <input
                          type="checkbox"
                          checked={values.includes(value)}
                          onChange={() => {
                            setOffset(0);
                            setSelectedAttributes((old) => ({
                              ...old,
                              [key]: values.includes(value)
                                ? values.filter((item) => item !== value)
                                : [...values, value],
                            }));
                          }}
                        />
                        {facet.name === 'Color' && (
                          <span
                            className="gh-filter-swatch"
                            style={{ backgroundColor: swatch || value }}
                            aria-hidden="true"
                          />
                        )}
                        <span>{value}</span> ({count})
                      </label>
                    );
                  })}
                {facet.values.length > 5 && (
                  <button
                    className="text-button gh-view-more"
                    onClick={() =>
                      setExpandedFacets((old) => ({
                        ...old,
                        [facet.name]: !old[facet.name],
                      }))
                    }
                  >
                    {expandedFacets[facet.name] ? 'View Less' : 'View More'}
                  </button>
                )}
              </details>
            ))}
          {!faceted &&
            !refined &&
            scoped.some((product) => product.variants[0]?.originalPrice) && (
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
          <div
            className={`catalog-toolbar${refined ? ' gr-catalog-toolbar' : ''}`}
          >
            <button
              className="filter-toggle button secondary"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Filters {filtersOpen ? '−' : '+'}
            </button>
            {faceted && (
              <div className="catalog-page-status">
                <button
                  aria-label="Previous page"
                  disabled={pageOffset === 0}
                  onClick={() => setOffset(Math.max(0, pageOffset - limit))}
                >
                  ‹
                </button>
                <span>
                  Page {Math.floor(pageOffset / limit) + 1} of{' '}
                  {Math.max(1, Math.ceil(filtered.length / limit))}
                </span>
                <button
                  aria-label="Next page"
                  disabled={pageOffset + limit >= filtered.length}
                  onClick={() => setOffset(pageOffset + limit)}
                >
                  ›
                </button>
                <span className="catalog-item-count">
                  {filtered.length} Items
                </span>
              </div>
            )}
            <span className={faceted ? 'default-product-count' : undefined}>
              {loading
                ? 'Finding your favorites…'
                : `${filtered.length} ${refined ? 'Items' : 'products'}`}
            </span>
            <label>
              {faceted || refined ? 'SORT BY:' : 'Sort by'}{' '}
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setOffset(0);
                }}
              >
                <option value="featured">
                  {refined ? 'Recommended' : 'Featured'}
                </option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
            <button
              className={`text-button${faceted || refined ? ' catalog-refresh' : ''}`}
              onClick={reload}
              disabled={loading}
            >
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
