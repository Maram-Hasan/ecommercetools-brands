import { useEffect, type ReactNode } from 'react';
import { useLocation } from './router';
import { SiteHeader } from '../components/layout/SiteHeader';
import { SiteFooter } from '../components/layout/SiteFooter';
import { MiniCart } from '../features/minicart/MiniCart';
import { useCart } from '../features/cart/CartProvider';
export function StorefrontLayout({ children }: { children: ReactNode }) {
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
      <SiteHeader quantity={cart.quantity} openCart={() => setOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <MiniCart />
    </>
  );
}
