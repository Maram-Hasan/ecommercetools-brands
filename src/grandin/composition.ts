import type { BrandComponents } from '../shared/containers/app/composition';
import { SiteHeader } from '../shared/containers/universal-header/container';
import { Home } from '../shared/containers/home/container';
import { SwatchProductInfo } from '../shared/containers/universal-pdp/partials/SwatchProductInfo';
import { ProductDetailsContent } from '../shared/containers/universal-pdp/partials/ProductDetailsContent';
import { ProductGallery } from '../shared/containers/universal-pdp/partials/ProductGallery';
import { SiteFooter } from '../shared/containers/universal-footer/container';
import { CompactMobileFilters } from '../shared/containers/product-list/CompactMobileFilters';

export const grandinComponents = {
  MobileCatalogFilters: CompactMobileFilters,
  Header: SiteHeader,
  Footer: SiteFooter,
  Home,
  ProductGallery,
  ProductInfo: SwatchProductInfo,
  ProductDetailsContent,
} satisfies BrandComponents;
