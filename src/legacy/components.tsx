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
