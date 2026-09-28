import type { ShopProduct } from '../../../models/product';
import { productSections } from '../parsers';

export function ProductDetailsContent({ product }: { product: ShopProduct }) {
  return (
    <section className="product-details-sections" id="product-details">
      {productSections(product.description).map((detail, index) => (
        <details key={detail.title} open={index === 0}>
          <summary>{detail.title}</summary>
          <p>{detail.content}</p>
        </details>
      ))}
    </section>
  );
}
