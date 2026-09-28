import type { BrandComponents } from '../shared/containers/app/composition';
import { GarnetHillHeader } from './containers/universal-header/container';
import { GarnetHillHome } from './containers/home/Home';
import { GarnetHillProductInfo } from './containers/universal-pdp/ProductInfo';
import { GarnetHillProductDetails } from './containers/universal-pdp/ProductDetails';
import { GarnetHillProductGallery } from './containers/universal-pdp/ProductGallery';
import { GarnetHillFooter } from './containers/universal-footer/container';

export const garnethillComponents = {
  Header: GarnetHillHeader,
  Footer: GarnetHillFooter,
  Home: GarnetHillHome,
  ProductGallery: GarnetHillProductGallery,
  ProductInfo: GarnetHillProductInfo,
  ProductDetailsContent: GarnetHillProductDetails,
} satisfies BrandComponents;
