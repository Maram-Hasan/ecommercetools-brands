import type { BrandComponents } from '../shared/containers/app/composition';
import { SiteHeader } from '../shared/containers/universal-header/container';
import { Home } from '../shared/containers/home/container';
import { TileProductInfo } from '../shared/containers/universal-pdp/partials/TileProductInfo';

export const frontgateComponents = {
  Header: SiteHeader,
  Home,
  ProductInfo: TileProductInfo,
} satisfies BrandComponents;
