import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useBrand } from '../../brands/context';
import { cartService } from '../../services/cart-service';
import { normalizeCart } from '../../mappers/cart.mapper';
import type { ShopProduct } from '../../domain/product';
import type { ShopCart } from '../../domain/cart';

interface CartState {
  cart: ShopCart;
  busy: boolean;
  loading: boolean;
  loadError: string;
  error: string;
  dismissError: () => void;
  refresh: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (
    product: ShopProduct,
    variantId: number,
    quantity: number,
  ) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  update: (id: string, quantity: number) => Promise<void>;
}
const Context = createContext<CartState | null>(null);
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error('CartProvider required');
  return value;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const brand = useBrand();
  const [cart, setCart] = useState(() => normalizeCart(null));
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const readRevision = useRef(0);
  const load = useCallback(async () => {
    const revision = ++readRevision.current;
    setLoading(true);
    try {
      const result = await cartService.cart(brand);
      if (mounted.current && revision === readRevision.current) {
        setCart(result);
        setLoadError('');
      }
    } catch (cause) {
      if (mounted.current && revision === readRevision.current)
        setLoadError(
          cause instanceof Error
            ? cause.message
            : 'Your bag could not be loaded.',
        );
    } finally {
      if (mounted.current && revision === readRevision.current)
        setLoading(false);
    }
  }, [brand]);
  const refresh = useCallback(async () => {
    if (!pending.current) await load();
  }, [load]);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    const refreshOnFocus = () => {
      if (!pending.current) void refresh();
    };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      mounted.current = false;
      readRevision.current++;
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [refresh]);
  async function mutate(operation: () => Promise<ShopCart>, reveal: boolean) {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError('');
    readRevision.current++;
    try {
      const result = await operation();
      if (!mounted.current) return false;
      readRevision.current++;
      setCart(result);
      setLoadError('');
      setLoading(false);
      if (reveal) setOpen(true);
      return true;
    } catch (cause) {
      if (mounted.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Your bag could not be updated.',
        );
        await load();
      }
      return false;
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        cart,
        busy,
        loading,
        loadError,
        error,
        dismissError: () => setError(''),
        refresh,
        open,
        setOpen,
        add: (product, variantId, quantity) =>
          mutate(
            () => cartService.add(brand, product.id, variantId, quantity),
            true,
          ),
        remove: async (id) => {
          await mutate(() => cartService.update(brand, id, 0), false);
        },
        update: async (id, quantity) => {
          await mutate(() => cartService.update(brand, id, quantity), false);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
