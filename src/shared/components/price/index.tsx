import type { ShopVariant } from '../../models/product';
import { formatPrice } from '../../utils/money';

export function Price({ variant }: { variant: ShopVariant }) {
  return (
    <div className="shop-price">
      {variant.originalPrice && <del>{formatPrice(variant.originalPrice)}</del>}
      <span className={variant.originalPrice ? 'sale-price' : ''}>
        {formatPrice(variant.price)}
      </span>
      {variant.originalPrice && <small>Special price</small>}
    </div>
  );
}
