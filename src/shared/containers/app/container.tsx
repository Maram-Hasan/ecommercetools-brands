import { BrandProvider } from '../../store/brand/provider';
import { CartProvider } from '../../store/cart/provider';
import { CatalogProvider } from '../../store/catalog/provider';
import { StorefrontLayout } from './StorefrontLayout';
import { PageOutlet } from './PageOutlet';
import {
  BrandCompositionProvider,
  type BrandCompositions,
} from './composition';

export default function App({ components }: { components: BrandCompositions }) {
  return (
    <BrandProvider>
      <BrandCompositionProvider components={components}>
        <CartProvider>
          <CatalogProvider>
            <StorefrontLayout>
              <PageOutlet />
            </StorefrontLayout>
          </CatalogProvider>
        </CartProvider>
      </BrandCompositionProvider>
    </BrandProvider>
  );
}
