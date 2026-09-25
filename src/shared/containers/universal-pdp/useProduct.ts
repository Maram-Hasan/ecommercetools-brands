import { useEffect, useState } from 'react';
import { useBrand } from '../../store/brand/context';
import { catalogService } from '../../APIs/catalog-service';
import type { ShopProduct } from '../../models/product';
export function useProduct(slug: string) {
  const brand = useBrand();
  const [product, setProduct] = useState<ShopProduct>();
  const [selected, setSelected] = useState(1);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setProduct(undefined);
    setError('');
    catalogService
      .product(brand, slug, controller.signal)
      .then((p) => {
        if (!controller.signal.aborted) {
          setProduct(p);
          setSelected(p.variants[0]?.id ?? 1);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [brand, slug, revision]);
  return {
    product,
    selected,
    setSelected,
    error,
    retry: () => setRevision((v) => v + 1),
  };
}
