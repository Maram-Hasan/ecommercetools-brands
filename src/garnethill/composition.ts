import type { BrandComponents } from '../shared/containers/app/composition';
import { GarnetHillHeader } from './containers/universal-header/container';
import { GarnetHillHome } from './containers/home/Home';
import { TileProductInfo } from '../shared/containers/universal-pdp/partials/TileProductInfo';

export const garnethillComponents = {
  Header: GarnetHillHeader,
  Home: GarnetHillHome,
  ProductInfo: TileProductInfo,
} satisfies BrandComponents;
