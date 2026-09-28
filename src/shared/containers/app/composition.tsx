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
import type { ShopProduct } from '../../models/product';
import type { ProductGalleryProps } from '../universal-pdp/partials/ProductGallery';

export interface BrandComponents {
  Header: ComponentType<HeaderProps>;
  Footer: ComponentType;
  Home: ComponentType;
  ProductGallery: ComponentType<ProductGalleryProps>;
  ProductInfo: ComponentType<ProductInfoProps>;
  ProductDetailsContent: ComponentType<{ product: ShopProduct }>;
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
