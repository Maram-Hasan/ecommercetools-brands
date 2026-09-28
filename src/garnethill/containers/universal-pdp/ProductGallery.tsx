import {
  ProductGallery,
  type ProductGalleryProps,
} from '../../../shared/containers/universal-pdp/partials/ProductGallery';

export function GarnetHillProductGallery(props: ProductGalleryProps) {
  return <ProductGallery {...props} className="gh-product-gallery" />;
}
