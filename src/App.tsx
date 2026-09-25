import { BrandProvider } from './brands/BrandProvider';
import { CartProvider } from './features/cart/CartProvider';
import { CatalogProvider } from './features/catalog/CatalogProvider';
import { StorefrontLayout } from './app/StorefrontLayout';
import { PageOutlet } from './app/PageOutlet';
import './styles/index.css';

export default function App() {
  return (
    <BrandProvider>
      <CartProvider>
        <CatalogProvider>
          <StorefrontLayout>
            <PageOutlet />
          </StorefrontLayout>
        </CatalogProvider>
      </CartProvider>
    </BrandProvider>
  );
}
