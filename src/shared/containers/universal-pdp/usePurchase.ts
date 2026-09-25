import { useState } from 'react';
import type { ShopProduct, ShopVariant } from '../../models/product';
import { useCart } from '../../store/cart/provider';

export interface ProductSelectionProps {
  product: ShopProduct;
  selected: number;
  onSelect: (id: number) => void;
}

export interface ProductInfoProps extends ProductSelectionProps {
  variant?: ShopVariant;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  busy: boolean;
  error: string;
  onAdd: () => void;
}

// Purchase behavior belongs to the PDP container; layouts only render props.
export function usePurchase(product: ShopProduct, selected: number) {
  const { add, busy, error } = useCart();
  const [quantity, setQuantity] = useState(1);
  const variant =
    product.variants.find((item) => item.id === selected) ??
    product.variants[0];
  return {
    variant,
    quantity,
    onQuantityChange: setQuantity,
    busy,
    error,
    onAdd: () => {
      if (!busy && variant?.price && variant.available !== false) {
        void add(product, variant.id, quantity);
      }
    },
  };
}
