import type { BrandComponents } from '../shared/containers/app/composition';
import { SiteHeader } from '../shared/containers/universal-header/container';
import { Home } from '../shared/containers/home/container';
import { SwatchProductInfo } from '../shared/containers/universal-pdp/partials/SwatchProductInfo';

export const grandinComponents = {
  Header: SiteHeader,
  Home,
  ProductInfo: SwatchProductInfo,
} satisfies BrandComponents;
