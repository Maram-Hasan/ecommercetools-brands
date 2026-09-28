import { useEffect, type ReactNode } from 'react';
import { useLocation } from './router';
import { useBrandComponents } from './composition';
import { MiniCart } from '../mini-cart/container';
import { useCart } from '../../store/cart/provider';
export function StorefrontLayout({ children }: { children: ReactNode }) {
  const { Header, Footer } = useBrandComponents();
  const location = useLocation();
  const { cart, setOpen } = useCart();
  useEffect(() => {
    setOpen(false);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location, setOpen]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header quantity={cart.quantity} openCart={() => setOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <MiniCart />
    </>
  );
}
