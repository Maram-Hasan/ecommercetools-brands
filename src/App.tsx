import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Cart } from '../shared/types';
import { request } from './api';
import { useResource } from './useResource';
import { BagIcon } from './components';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { CartPage } from './pages/CartPage';
import { findStorefront, storefronts } from '../shared/storefronts';
import {
  selectedStoreKey,
  StorefrontContext,
  switchStore,
  useStorefront,
} from './storefront';

export default function App() {
  const store = findStorefront(selectedStoreKey());
  if (!store) {
    return (
      <main>
        <div className="state-panel" role="alert">
          <h1>Store not found</h1>
          <p>Select a storefront to continue.</p>
          {storefronts.map((item) => (
            <p key={item.key}>
              <a className="button" href={`?store=${item.key}`}>
                {item.name}
              </a>
            </p>
          ))}
        </div>
      </main>
    );
  }
  const theme = {
    '--color-primary': store.theme.primary,
    '--color-primary-hover': store.theme.primaryHover,
    '--color-background': store.theme.background,
    '--color-surface': store.theme.surface,
    '--color-accent': store.theme.accent,
    '--color-text': store.theme.text,
    '--product-columns': store.productsPerRow,
  } as CSSProperties;
  return (
    <StorefrontContext.Provider value={store}>
      <div
        className="storefront"
        style={theme}
        data-layout={store.productLayout}
      >
        <StorefrontApp />
      </div>
    </StorefrontContext.Provider>
  );
}

function StorefrontApp() {
  const store = useStorefront();
  const [route, setRoute] = useState(window.location.hash || '#/');
  const cart = useResource<Cart | null>('/cart');
  const [busy, setBusy] = useState(false);
  const mutationPending = useRef(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  useEffect(() => {
    document.title = `${store.name} — Storefront`;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', store.theme.primary);
  }, [store]);

  useEffect(() => {
    const navigate = () => {
      setRoute(window.location.hash || '#/');
      setNotice(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  const isCart = route === '#/cart';
  useEffect(() => {
    if (isCart) cart.reload();
  }, [isCart, cart.reload]);

  async function mutate(
    path: string,
    method: string,
    body: object,
    success: string,
  ) {
    if (mutationPending.current || cart.loading) return;
    mutationPending.current = true;
    setBusy(true);
    setNotice(null);
    try {
      cart.setData(
        await request<Cart>(path, { method, body: JSON.stringify(body) }),
      );
      cart.reload();
      setNotice({ text: success, error: false });
    } catch (cause) {
      setNotice({
        text:
          cause instanceof Error ? cause.message : 'Unable to update your bag.',
        error: true,
      });
      cart.reload();
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  }

  const productId = route.match(/^#\/products\/([a-f0-9-]+)$/i)?.[1];
  return (
    <>
      <div className="announcement">{store.announcement}</div>
      <header className="site-header">
        <a className="wordmark" href="#/" aria-label={`${store.name} home`}>
          {store.brand}
          <span>®</span>
        </a>
        <label className="store-switcher">
          <span>Store</span>
          <select
            aria-label="Store"
            value={store.key}
            disabled={busy}
            onChange={(event) => switchStore(event.target.value)}
          >
            {storefronts.map((item) => (
              <option key={item.key} value={item.key}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Main navigation">
          <a href="#/" className={!isCart ? 'active' : ''}>
            Collection
          </a>
          <a className={`bag-link ${isCart ? 'active' : ''}`} href="#/cart">
            <BagIcon />
            <span>Bag</span>
            <span
              className="bag-count"
              aria-label={`${cart.data?.quantity ?? 0} items`}
            >
              {cart.data?.quantity ?? 0}
            </span>
          </a>
        </nav>
      </header>
      <main id="main">
        {notice && (
          <div
            className={`notice ${notice.error ? 'notice-error' : ''}`}
            role={notice.error ? 'alert' : 'status'}
          >
            <span>
              {notice.text}{' '}
              {!notice.error && !isCart && <a href="#/cart">View bag →</a>}
            </span>
            <button
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}
        {cart.error && !isCart && (
          <div className="notice notice-error" role="alert">
            <span>Bag: {cart.error}</span>
            <button onClick={cart.reload}>Retry</button>
          </div>
        )}
        {isCart ? (
          <CartPage
            cart={cart.data}
            loading={cart.loading}
            error={cart.error}
            retry={cart.reload}
            busy={busy}
            updateQuantity={(id, quantity) =>
              mutate(
                `/cart/items/${id}`,
                'PATCH',
                { quantity },
                quantity === 0
                  ? 'Item removed from your bag.'
                  : 'Your bag has been updated.',
              )
            }
          />
        ) : productId ? (
          <ProductDetails
            key={productId}
            id={productId}
            busy={busy || cart.loading || !!cart.error}
            addToCart={(id, variantId, quantity) =>
              mutate(
                '/cart/items',
                'POST',
                { productId: id, variantId, quantity },
                'A good find. Added to your bag.',
              )
            }
          />
        ) : route === '#/' || route === '#' ? (
          <Catalog />
        ) : (
          <div className="state-panel">
            <h1>Page not found</h1>
            <a href="#/" className="button">
              Back to collection
            </a>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <a href="#/" className="wordmark">
          {store.brand}
          <span>®</span>
        </a>
        <p>{store.headline.join(' ')}</p>
        <span>Take a look. Find a favorite.</span>
      </footer>
    </>
  );
}
