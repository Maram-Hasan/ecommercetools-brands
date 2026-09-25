import {
  createContext,
  useContext,
  type ComponentType,
  type ReactNode,
} from 'react';
import type { BrandConfig } from '../../../../shared/brands';
import { useBrand } from '../../store/brand/context';
import type { HeaderProps } from '../universal-header/container';
import type { ProductInfoProps } from '../universal-pdp/usePurchase';

export interface BrandComponents {
  Header: ComponentType<HeaderProps>;
  Home: ComponentType;
  ProductInfo: ComponentType<ProductInfoProps>;
}
export type BrandCompositions = Record<BrandConfig['key'], BrandComponents>;
const Context = createContext<BrandComponents | null>(null);

export function BrandCompositionProvider({
  components,
  children,
}: {
  components: BrandCompositions;
  children: ReactNode;
}) {
  const brand = useBrand();
  return (
    <Context.Provider value={components[brand.key]}>
      {children}
    </Context.Provider>
  );
}

export function useBrandComponents() {
  const components = useContext(Context);
  if (!components) throw new Error('BrandCompositionProvider required');
  return components;
}
