import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../app/router';
import { formatPrice } from '../../utils/money';
import { useCart } from '../../store/cart/provider';
import { Icon, Modal } from '../../components/primitives/index';
import { CartStatus } from '../../components/cart-status/index';
import { CartItem } from '../../components/cart-item/index';
import { InfoDialog } from '../../components/info-dialog';
function CartPreview({
  title,
  top,
  onClose,
  children,
  empty = false,
}: {
  title: string;
  top: number;
  onClose: () => void;
  children: ReactNode;
  empty?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preview = ref.current!;
    preview.showPopover();
    return () => preview.hidePopover();
  }, []);
  return (
    <div
      ref={ref}
      popover="auto"
      role="dialog"
      aria-label={title}
      className={`shop-modal drawer mini-cart-preview${empty ? ' mini-cart-preview-empty' : ''}`}
      style={{ '--cart-preview-top': `${top}px` } as CSSProperties}
      onToggle={(event) => {
        if (event.newState === 'closed') onClose();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') onClose();
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
    </div>
  );
}

export function MiniCart({
  previewTop = null,
  closePreview = () => {},
}: {
  previewTop?: number | null;
  closePreview?: () => void;
}) {
  const brand = useBrand();
  const [signingIn, setSigningIn] = useState(false);
  const { cart, open, setOpen, loadError, loading, busy } = useCart();
  if (signingIn)
    return (
      <InfoDialog title="My Account" onClose={() => setSigningIn(false)} />
    );
  if (!open && previewTop === null) return null;
  const ready = !loadError && !loading;
  const emptyPreview = !open && ready && cart.items.length === 0;
  const close = () => {
    setOpen(false);
    closePreview();
  };
  const content = (
    <>
      <CartStatus />
      {cart.items.length ? (
        <>
          <div className="mini-cart-items">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} compact onNavigate={close} />
            ))}
          </div>
          <div className="mini-cart-bottom">
            <p className="mini-cart-shipping-note">
              Taxes and shipping calculated at checkout
            </p>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <Link
              className="button full"
              href={`${brand.route}/cart`}
              onClick={close}
            >
              View Bag
            </Link>
            <button
              className="button secondary full continue-shopping"
              disabled={!ready || busy}
              onClick={close}
            >
              Continue Shopping
            </button>
          </div>
        </>
      ) : emptyPreview ? (
        <div className="mini-cart-empty-content">
          <h3>Looking for your saved finds?</h3>
          <p>
            <button
              className="mini-cart-sign-in"
              onClick={() => {
                close();
                setSigningIn(true);
              }}
            >
              Sign in
            </button>{' '}
            to see items from previous visits or other devices.
          </p>
          <Link
            className="button full"
            href={`${brand.route}/cart`}
            onClick={close}
          >
            View Cart
          </Link>
        </div>
      ) : (
        ready && (
          <div className="empty-state">
            <Icon name="bag" size={40} />
            <h2>A little room for something lovely.</h2>
            <p>
              Your bag is empty. Find a new favorite to make yourself at home.
            </p>
            <Link
              className="button"
              href={`${brand.route}/category/all-products`}
              onClick={close}
            >
              Explore the Collection
            </Link>
          </div>
        )
      )}
    </>
  );
  const title = emptyPreview
    ? 'In Your Cart (0)'
    : `In Your Bag (${cart.quantity})`;
  return open ? (
    <Modal title={title} variant="drawer" onClose={close}>
      {content}
    </Modal>
  ) : (
    <CartPreview
      title={title}
      top={previewTop!}
      onClose={close}
      empty={emptyPreview}
    >
      {content}
    </CartPreview>
  );
}
