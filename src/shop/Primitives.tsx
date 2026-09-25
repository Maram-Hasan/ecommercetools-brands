import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useBrand } from '../brands/context';

export function Icon({
  name,
  size = 22,
}: {
  name:
    | 'search'
    | 'bag'
    | 'cart'
    | 'user'
    | 'menu'
    | 'close'
    | 'arrow'
    | 'heart'
    | 'truck'
    | 'check'
    | 'lock'
    | 'book'
    | 'support';
  size?: number;
}) {
  const paths = {
    book: (
      <>
        <path d="M12 5v15M3 4l9 2 9-2v15l-9 2-9-2V4Z" />
        <path d="m6 8 3 1m6 0 3-1M6 12l3 1m6 0 3-1" />
      </>
    ),
    support: (
      <>
        <path d="M4 13v-2a8 8 0 0 1 16 0v2M20 17v1a3 3 0 0 1-3 3h-3" />
        <rect x="2" y="11" width="4" height="7" rx="2" />
        <rect x="18" y="11" width="4" height="7" rx="2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    cart: (
      <>
        <path d="M2 3h3l3 13h11l3-10H6M8 16l-1 3h12" />
        <circle cx="9" cy="22" r="1" />
        <circle cx="18" cy="22" r="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
    heart: (
      <path d="M20 4a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 1 10 8 16 7-6 13-11 8-16Z" />
    ),
    truck: (
      <>
        <path d="M2 5h12v13H2zM14 10h4l4 5v3h-8" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="1" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Modal({
  title,
  onClose,
  children,
  variant = 'dialog',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  variant?: 'dialog' | 'drawer' | 'navigation-drawer';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  // Keep the dialog in its theme subtree: native showModal supplies focus trapping,
  // Escape handling and a top-layer backdrop without losing CSS variables.
  return (
    <dialog
      className={`shop-modal ${variant}`}
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function Breadcrumbs({
  items,
  separator = '/',
}: {
  items: { label: string; href?: string }[];
  separator?: string;
}) {
  const brand = useBrand();
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href={brand.route}>Home</Link>
      {items.map((item, index) => (
        <span key={index}>
          <span aria-hidden="true">{separator}</span>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function QuantitySelector({
  value,
  onChange,
  disabled = false,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  max?: number;
}) {
  return (
    <div className="quantity-selector">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-label="Quantity">{value}</output>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

export function InlineError({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="inline-error" role="alert">
      {message}
      {retry && (
        <button className="text-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingCards() {
  return (
    <div className="shop-grid" role="status" aria-label="Loading products">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="loading-card" />
      ))}
    </div>
  );
}
