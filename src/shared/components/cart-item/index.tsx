import { useState } from 'react';
import { useBrand } from '../../store/brand/context';
import { Link } from '../../containers/app/router';
import { formatPrice } from '../../utils/money';
import { ProductImage } from '../product-image/index';
import type { ShopCartItem } from '../../models/cart';
import { useCart } from '../../store/cart/provider';
import { Icon, Modal, QuantitySelector } from '../primitives/index';

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
  const [dialog, setDialog] = useState<'edit' | 'save' | null>(null);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
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
        {compact ? (
          <>
            <p className="mini-cart-quantity">Qty: {item.quantity}</p>
            <span className="bag-unit-price">{formatPrice(item.price)}</span>
          </>
        ) : (
          <>
            {(item.sku || item.productNumber) && (
              <p className="bag-item-number">
                Item: #{item.sku || item.productNumber}
              </p>
            )}
            {item.attributes?.map((attribute) => (
              <p className="bag-item-option" key={attribute.name}>
                <span>
                  {attribute.name.charAt(0).toUpperCase() +
                    attribute.name.slice(1)}
                  :
                </span>{' '}
                {attribute.value}
              </p>
            ))}
          </>
        )}
        <div className="bag-item-controls">
          {!compact && (
            <QuantitySelector
              value={item.quantity}
              disabled={disabled}
              onChange={(quantity) => void update(item.id, quantity)}
            />
          )}
          {!compact && brand.cart.edit && (
            <button
              className="text-button"
              disabled={disabled}
              onClick={() => {
                setEditQuantity(item.quantity);
                setDialog('edit');
              }}
            >
              <Icon name="edit" size={20} />
              Edit
            </button>
          )}
          <button
            className="text-button"
            disabled={disabled}
            onClick={() => void remove(item.id)}
          >
            <Icon name="trash" size={compact ? 15 : 20} />
            Remove
          </button>
          {!compact && (
            <button
              className="text-button"
              disabled={disabled}
              onClick={() => setDialog('save')}
            >
              <Icon name="heart" size={20} />
              Save for Later
            </button>
          )}
        </div>
        {!compact && (
          <div className="bag-item-shipping">
            <Icon name="truck" size={23} />
            <span>
              {item.available === true
                ? 'In-Stock'
                : item.available === false
                  ? 'Currently unavailable'
                  : 'Shipping details available at checkout'}
            </span>
          </div>
        )}
      </div>
      {!compact && (
        <strong className="bag-line-total">{formatPrice(item.total)}</strong>
      )}
      {dialog && (
        <Modal
          title={dialog === 'edit' ? 'Edit Item' : 'Save for Later'}
          onClose={() => setDialog(null)}
        >
          {dialog === 'edit' ? (
            <div className="cart-edit-item">
              <h3>{item.name}</h3>
              <p>{item.sku}</p>
              <QuantitySelector
                value={editQuantity}
                disabled={disabled}
                onChange={setEditQuantity}
              />
              <Link href={href}>View product details and options</Link>
              <button
                className="button"
                disabled={disabled}
                onClick={async () => {
                  await update(item.id, editQuantity);
                  setDialog(null);
                }}
              >
                Update Quantity
              </button>
            </div>
          ) : (
            <p className="cart-notice">
              Saved items are not connected in this preview. This item remains
              in your cart.
            </p>
          )}
        </Modal>
      )}
    </article>
  );
}
