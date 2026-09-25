import { useState } from 'react';
import type { ProductPage } from '../../../shared/domain/product';
import { useResource } from '../useResource';
import { ErrorState } from '../components';
import { formatPrice } from '../../shared/utils/money';
import { Loading } from '../components';
import { ProductImage } from '../../shared/components/product-image/index';
import { useStorefront } from '../storefront';

export function Catalog() {
  const store = useStorefront();
  const [offset, setOffset] = useState(0);
  const { data, loading, error, reload } = useResource<ProductPage>(
    `/products?offset=${offset}`,
  );
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">{store.name.toUpperCase()}</p>
          <h1>
            {store.headline[0]}
            <br />
            <em>{store.headline[1]}</em>
          </h1>
          <p className="hero-copy">{store.description}</p>
          <a
            href="#collection"
            className="text-link"
            onClick={(event) => {
              event.preventDefault();
              document
                .getElementById('collection')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore the collection <span aria-hidden="true">↘</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-circle" />
          <div className="art-vase" />
          <div className="art-stem stem-one" />
          <div className="art-stem stem-two" />
          <div className="art-leaf leaf-one" />
          <div className="art-leaf leaf-two" />
          <span className="art-caption">A LITTLE ROOM FOR SOMETHING GOOD.</span>
        </div>
      </section>
      <section
        id="collection"
        className="collection"
        aria-labelledby="collection-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR NEXT FAVORITE</p>
            <h2 id="collection-title">The collection</h2>
          </div>
          <span className="muted">
            {data && !loading
              ? `${data.total} products`
              : 'Made for your everyday'}
          </span>
        </div>
        {loading ? (
          <Loading cards />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : !data?.products.length ? (
          <div className="state-panel">
            <h3>No products yet</h3>
            <p>Published products from your collection will appear here.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {data.products.map((product) => {
                const variant = product.variants[0];
                return (
                  <article className="product-card" key={product.id}>
                    <a
                      className="product-link"
                      href={`#/products/${product.id}`}
                    >
                      <div className="product-image">
                        <ProductImage
                          src={variant?.images[0]}
                          name={product.name}
                        />
                        <span className="card-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-code">
                          {variant?.sku || product.key || product.id}
                        </p>
                        {store.showProductDescription &&
                          product.description && (
                            <p className="card-description">
                              {product.description}
                            </p>
                          )}
                        <p className="price">{formatPrice(variant?.price)}</p>
                        {store.productLayout === 'list' && (
                          <span className="view-product">
                            View product <span aria-hidden="true">↗</span>
                          </span>
                        )}
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
            <div className="pagination">
              <button
                className="button secondary"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - data.limit))}
              >
                ← Previous
              </button>
              <span>
                {offset + 1}–{offset + data.products.length} of {data.total}
              </span>
              <button
                className="button secondary"
                disabled={
                  offset + data.limit >= data.total ||
                  offset + data.limit > 10000
                }
                onClick={() => setOffset(offset + data.limit)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
