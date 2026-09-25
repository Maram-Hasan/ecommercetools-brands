import { useBrand } from '../../brands/context';
import type { ShopProduct } from '../../domain/product';
import { SwatchProductInfo } from './SwatchProductInfo';
import { TileProductInfo } from './TileProductInfo';

export function ProductInfo({
  product,
  selected,
  onSelect,
}: {
  product: ShopProduct;
  selected: number;
  onSelect: (id: number) => void;
}) {
  const brand = useBrand();
  return brand.pdp.purchase === 'tiles' ? (
    <TileProductInfo
      product={product}
      selected={selected}
      onSelect={onSelect}
    />
  ) : (
    <SwatchProductInfo
      product={product}
      selected={selected}
      onSelect={onSelect}
    />
  );
}
