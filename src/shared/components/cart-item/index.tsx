import { useBrand } from '../../store/brand/context';
import { Link } from '../../containers/app/router';
import { formatPrice } from '../../utils/money';
import { ProductImage } from '../product-image/index';
import type { ShopCartItem } from '../../models/cart';
import { useCart } from '../../store/cart/provider';
import { QuantitySelector } from '../primitives/index';

export function CartItem({
  item,
  compact = false,
  onNavigate,
}: {
  item: ShopCartItem;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const brand = useBrand();
  const { busy, update, remove, loadError, loading } = useCart();
  const disabled = busy || !!loadError || loading;
  const href = `${brand.route}/product/${encodeURIComponent(item.slug || item.productId)}`;
  return (
    <article className={`bag-item ${compact ? 'compact' : ''}`}>
      <Link href={href} className="bag-item-image" onClick={onNavigate}>
        <ProductImage src={item.image} name={item.name} />
      </Link>
      <div className="bag-item-description">
        <Link href={href} onClick={onNavigate}>
          <h3>{item.name}</h3>
        </Link>
        <p>{item.sku || 'Selected option'}</p>
        <span className="bag-unit-price">{formatPrice(item.price)} each</span>
        <div className="bag-item-controls">
          <QuantitySelector
            value={item.quantity}
            disabled={disabled}
            onChange={(quantity) => void update(item.id, quantity)}
          />
          <button
            className="text-button"
            disabled={disabled}
            onClick={() => void remove(item.id)}
          >
            Remove
          </button>
        </div>
      </div>
      <strong className="bag-line-total">{formatPrice(item.total)}</strong>
    </article>
  );
}
