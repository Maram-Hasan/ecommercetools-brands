import { useState } from 'react';
import type { Money } from '../shared/types';

export function formatPrice(price: Money | null | undefined) {
  return price
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: price.currencyCode,
      }).format(price.amount / 10 ** price.fractionDigits)
    : 'Price unavailable';
}

export function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M5 7h14l1 14H4L5 7Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

export function ProductImage({
  src,
  name,
  eager = false,
}: {
  src?: string;
  name: string;
  eager?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return src && failedUrl !== src ? (
    <img
      src={src}
      alt={name}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailedUrl(src)}
    />
  ) : (
    <div className="image-placeholder">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="m8 15 16-8 16 8v19l-16 8-16-8V15Z" />
        <path d="m8 15 16 8 16-8M24 23v19M16 11l16 8" />
      </svg>
      <span>No image available</span>
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="state-panel" role="alert">
      <h2>We couldn’t load that.</h2>
      <p>{message}</p>
      <button className="button secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

export function Loading({ cards = false }: { cards?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading" role="status">
      <span className="sr-only">Loading…</span>
      {cards ? (
        <div className="product-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton skeleton-image" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      ) : (
        <div className="state-panel">
          <span className="spinner" />
          <p>Just a moment…</p>
        </div>
      )}
    </div>
  );
}
