import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useBrand } from '../brands/context';
import { commerce, normalizeCart } from '../services/commerce';
import type { ShopProduct, ShopCart } from '../services/models';

interface CartState {
  cart: ShopCart;
  busy: boolean;
  liveLoading: boolean;
  liveError: string;
  error: string;
  dismissError: () => void;
  refreshLive: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (
    product: ShopProduct,
    variantId: number,
    quantity: number,
  ) => Promise<boolean>;
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
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const readRevision = useRef(0);
  async function refreshLive() {
    const revision = ++readRevision.current;
    setLiveLoading(true);
    try {
      const result = await commerce.cart(brand);
      if (mounted.current && revision === readRevision.current) {
        setCart(result);
        setLiveError('');
      }
    } catch (cause) {
      if (mounted.current && revision === readRevision.current)
        setLiveError(
          cause instanceof Error
            ? cause.message
            : 'Your bag could not be loaded.',
        );
    } finally {
      if (mounted.current && revision === readRevision.current)
        setLiveLoading(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
    void refreshLive();
    const refreshOnFocus = () => {
      if (!pending.current) void refreshLive();
    };
    window.addEventListener('focus', refreshOnFocus);
    return () => {
      mounted.current = false;
      readRevision.current++;
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [brand]);
  async function mutate(operation: () => Promise<ShopCart>, reveal: boolean) {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError('');
    readRevision.current++;
    try {
      const result = await operation();
      if (!mounted.current) return false;
      setCart(result);
      setLiveError('');
      setLiveLoading(false);
      if (reveal) setOpen(true);
      return true;
    } catch (cause) {
      if (mounted.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Your bag could not be updated.',
        );
        await refreshLive();
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
        liveLoading,
        liveError,
        error,
        dismissError: () => setError(''),
        refreshLive,
        open,
        setOpen,
        add: (product, variantId, quantity) =>
          mutate(
            () => commerce.add(brand, product.id, variantId, quantity),
            true,
          ),
        update: async (id, quantity) => {
          await mutate(() => commerce.update(brand, id, quantity), false);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
