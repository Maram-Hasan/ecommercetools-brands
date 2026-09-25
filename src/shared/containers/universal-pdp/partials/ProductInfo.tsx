import { useBrandComponents } from '../../app/composition';
import { usePurchase, type ProductSelectionProps } from '../usePurchase';

export function ProductInfo(props: ProductSelectionProps) {
  const { ProductInfo: Presentation } = useBrandComponents();
  const purchase = usePurchase(props.product, props.selected);
  return <Presentation {...props} {...purchase} />;
}
