import { createContext, useContext } from 'react';
import type { BrandConfig } from '../../../../shared/brands/index';
export const BrandContext = createContext<BrandConfig | null>(null);
export function useBrand() {
  const brand = useContext(BrandContext);
  if (!brand) throw new Error('BrandProvider required');
  return brand;
}
