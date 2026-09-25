import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useBrand } from '../../brands/context';
import { catalogService } from '../../services/catalog-service';
import type { ShopProduct } from '../../domain/product';
import type { ProductCategory } from '../../../shared/domain/category';

interface CatalogState {
  products: ShopProduct[];
  categories: ProductCategory[];
  loading: boolean;
  error: string;
  reload: () => void;
}
const Context = createContext<CatalogState | null>(null);
export function useCatalog() {
  const value = useContext(Context);
  if (!value) throw new Error('CatalogProvider required');
  return value;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const brand = useBrand();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    catalogService
      .catalog(brand, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setProducts(items);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setProducts([]);
          setError(
            cause instanceof Error
              ? cause.message
              : 'The collection could not be loaded.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [brand, revision]);
  const categories = useMemo(
    () =>
      [
        ...new Map(
          products
            .flatMap((product) => product.categories)
            .map((category) => [category.id, category]),
        ).values(),
      ].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );
  return (
    <Context.Provider
      value={{
        products,
        categories,
        loading,
        error,
        reload: () => setRevision((value) => value + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
