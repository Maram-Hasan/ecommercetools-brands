import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from './router';
import { useBrandComponents } from './composition';
import { MiniCart } from '../mini-cart/container';
import { useCart } from '../../store/cart/provider';
export function StorefrontLayout({ children }: { children: ReactNode }) {
  const { Header, Footer } = useBrandComponents();
  const location = useLocation();
  const { cart, setOpen } = useCart();
  const [previewTop, setPreviewTop] = useState<number | null>(null);
  useEffect(() => {
    setOpen(false);
    setPreviewTop(null);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location, setOpen]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header
        quantity={cart.quantity}
        openCart={(anchor) => {
          if (anchor) setPreviewTop(anchor.getBoundingClientRect().bottom + 8);
          else setOpen(true);
        }}
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <MiniCart
        previewTop={previewTop}
        closePreview={() => setPreviewTop(null)}
      />
    </>
  );
}
