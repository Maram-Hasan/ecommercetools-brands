// Public presentation settings only. Never put credentials in this file.
export interface Storefront {
  key: string;
  name: string;
  brand: string;
  announcement: string;
  headline: [string, string];
  description: string;
  productLayout: 'grid' | 'list';
  productsPerRow: 2 | 3 | 4;
  showProductDescription: boolean;
  theme: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    accent: string;
    text: string;
  };
  // Add named flags here when an actual integration is implemented.
  features: Record<string, boolean>;
}

export const storefronts: Storefront[] = [
  {
    key: 'b2c-retail-store',
    name: 'B2C Retail Store',
    brand: 'everyday',
    announcement: 'Thoughtful finds. Everyday favorites.',
    headline: ['Good things.', 'For every day.'],
    description:
      'Discover the pieces that make your everyday a little more yours.',
    productLayout: 'grid',
    productsPerRow: 4,
    showProductDescription: false,
    theme: {
      primary: '#264d3c',
      primaryHover: '#1c392d',
      background: '#fcfbf8',
      surface: '#f0efe9',
      accent: '#edf0e4',
      text: '#24372e',
    },
    features: {},
  },
  {
    key: 'second_store_explore',
    name: 'Explore 2',
    brand: 'explore',
    announcement: 'Fresh perspectives. A space that feels like you.',
    headline: ['A different view.', 'More to explore.'],
    description: 'Find your next favorite, with a closer look at every detail.',
    productLayout: 'list',
    productsPerRow: 2,
    showProductDescription: true,
    theme: {
      primary: '#6145d9',
      primaryHover: '#4930b0',
      background: '#fcfaff',
      surface: '#f0edf7',
      accent: '#eee8fc',
      text: '#332449',
    },
    features: {},
  },
];

export const defaultStoreKey = storefronts[0].key;

export function findStorefront(key: string) {
  return storefronts.find((store) => store.key === key);
}
