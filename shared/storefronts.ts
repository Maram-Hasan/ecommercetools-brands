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

export interface BrandConfig {
  key: 'fg' | 'gr' | 'gh';
  route: string;
  storeKey: string;
  displayName: string;
  wordmark: { asset: string; aspectRatio: string; desktopWidth: string };
  typography: { heading: string; body: string; tracking: string };
  spacing: { page: string; section: string; grid: string };
  colors: {
    primary: string;
    ink: string;
    muted: string;
    wash: string;
    promo: string;
    logo: string;
  };
  header: {
    layout: 'search-center' | 'search-right' | 'editorial';
    searchPlaceholder: string;
    utility: string[];
    border: string;
    surface: string;
    navigation: {
      label: string;
      categories?: string[];
      search?: string;
      emphasis?: boolean;
    }[];
    secondaryNavigation?: {
      label: string;
      categories?: string[];
      search?: string;
    }[];
  };
  buttons: { transform: 'uppercase' | 'none'; radius: string };
  features: { quickShop: boolean; swatchesOnCards: boolean };
  footer: {
    heading: string;
    description: string;
    columns: { title: string; links: string[] }[];
    highlights?: { title: string; action: string }[];
  };
  promo: { headline: string; detail: string };
  home: {
    eyebrow: string;
    headline: string;
    description: string;
    cta: string;
    category: string;
    secondaryTitle: string;
    preferredCategories?: string[];
  };
  catalog: { title: string; description: string };
  gallery: 'vertical' | 'horizontal';
  minicart: 'wide' | 'compact';
  pdp?: {
    layout: 'production' | 'frontgate' | 'garnet-hill';
    addLabel?: string;
    primary: string;
    accent: string;
    border: string;
    surface: string;
  };
}

const footerColumns = [
  {
    title: 'Customer Service',
    links: [
      'Contact Us',
      'Order Status',
      'Shipping & Delivery',
      'Returns & Exchanges',
      'FAQs',
    ],
  },
  {
    title: 'Ways to Shop',
    links: [
      'Shop the Catalog',
      'Request a Catalog',
      'Gift Cards',
      'New Arrivals',
    ],
  },
  {
    title: 'Get to Know Us',
    links: [
      'Our Story',
      'Our Commitment',
      'Design Inspiration',
      'Accessibility',
    ],
  },
];

export const brands: Record<BrandConfig['key'], BrandConfig> = {
  gh: {
    key: 'gh',
    route: '/gh',
    storeKey: 'garnethill',
    displayName: 'Garnet Hill',
    wordmark: {
      asset: '/brands/gh/logo.svg',
      aspectRatio: '459 / 60.2',
      desktopWidth: '244px',
    },
    typography: {
      heading: '"Kepler Std", Georgia, "Times New Roman", serif',
      body: 'Arial, Helvetica, sans-serif',
      tracking: '0.08em',
    },
    spacing: { page: '32px', section: '64px', grid: '24px' },
    colors: {
      primary: '#716b61',
      ink: '#45423f',
      muted: '#706c66',
      wash: '#f5f3ef',
      promo: '#605565',
      logo: '#645d54',
    },
    header: {
      layout: 'editorial',
      searchPlaceholder: 'What can we help you find?',
      utility: ['Request a Catalog', 'Design Services', 'Customer Service'],
      border: '#dedbd5',
      surface: '#faf9f7',
      navigation: [
        {
          label: 'New Arrivals',
          categories: ['New Arrivals', 'New'],
          search: 'new',
        },
        {
          label: 'Clothing',
          categories: ['Clothing', 'Women’s Clothing', 'Womens Clothing'],
          search: 'clothing',
        },
        {
          label: 'Shoes & Accessories',
          categories: ['Shoes & Accessories', 'Accessories'],
          search: 'shoes',
        },
        { label: 'Cashmere', categories: ['Cashmere'], search: 'cashmere' },
        { label: 'Flannel', categories: ['Flannel'], search: 'flannel' },
        {
          label: 'Bedding & Home',
          categories: ['Bedding & Home', 'Bedding', 'Bed & Bath', 'Home Decor'],
          search: 'bedding',
        },
        {
          label: 'Sale',
          categories: ['Sale', 'Clearance'],
          search: 'sale',
          emphasis: true,
        },
      ],
      secondaryNavigation: [
        { label: '50th Anniversary', search: 'heritage' },
        { label: 'Fall Decor', categories: ['Fall Decor'], search: 'fall' },
        {
          label: 'Eileen Fisher',
          categories: ['Eileen Fisher'],
          search: 'Eileen Fisher',
        },
        { label: 'Editors’ Picks', search: 'editors picks' },
      ],
    },
    buttons: { transform: 'uppercase', radius: '0px' },
    features: { quickShop: true, swatchesOnCards: true },
    footer: {
      heading: 'A little inspiration in your inbox',
      description:
        'Discover new arrivals and thoughtful finds for you and your home.',
      columns: [
        {
          title: 'Customer Service',
          links: [
            'Contact Us',
            'Order Status',
            'Shipping & Delivery',
            'Returns & Exchanges',
            'Size Guide',
          ],
        },
        {
          title: 'About Garnet Hill',
          links: ['Our Story', 'Our Values', 'Our Responsibility', 'Careers'],
        },
        {
          title: 'Ways to Shop',
          links: [
            'Shop the Catalog',
            'Request a Catalog',
            'Store Locations',
            'Gift Cards',
          ],
        },
      ],
      highlights: [
        { title: 'Digital Catalog', action: 'Explore Now' },
        { title: 'Store Locations', action: 'Find Your Store' },
        { title: 'Shopping Guides', action: 'Explore More' },
        { title: 'Design Services', action: 'Get Started' },
      ],
    },
    promo: {
      headline: 'For you. For your home.',
      detail: 'Explore the Garnet Hill collection',
    },
    home: {
      eyebrow: 'GARNET HILL',
      headline: 'Comfort,\nbeautifully considered.',
      description:
        'Find your everyday favorites.\nThoughtful pieces for your home and for you.',
      cta: 'Shop Now',
      category: 'all-products',
      secondaryTitle: 'Shop by Category',
      preferredCategories: [
        'Bedding',
        'Bed & Bath',
        'Clothing',
        'Bedroom Furniture',
      ],
    },
    catalog: {
      title: 'All Products',
      description: 'Discover the collection for your home and for you.',
    },
    gallery: 'vertical',
    minicart: 'compact',
    pdp: {
      layout: 'garnet-hill',
      addLabel: 'ADD TO BAG',
      primary: '#716b61',
      accent: '#716b61',
      border: '#d5d0c9',
      surface: '#f5f3ef',
    },
  },
  fg: {
    key: 'fg',
    route: '/fg',
    storeKey: 'frontgate',
    displayName: 'Frontgate',
    wordmark: {
      asset: '/brands/fg/logo.svg',
      aspectRatio: '296 / 28',
      desktopWidth: '292px',
    },
    typography: {
      heading: 'Arial, Helvetica, sans-serif',
      body: 'Arial, Helvetica, sans-serif',
      tracking: '0.13em',
    },
    spacing: { page: '32px', section: '64px', grid: '24px' },
    colors: {
      primary: '#252525',
      ink: '#252525',
      muted: '#6c7071',
      wash: '#f6f6f4',
      promo: '#f0f0ed',
      logo: '#252525',
    },
    header: {
      layout: 'search-center',
      searchPlaceholder: 'What can we help you find?',
      utility: ['Free Design Services', 'Order Status'],
      border: '#dedede',
      surface: '#ffffff',
      navigation: [
        {
          label: 'NEW & TRENDING',
          categories: ['New Arrivals', 'New'],
          search: 'new',
        },
        { label: 'OUTDOOR', categories: ['Outdoor', 'Outdoor Living'] },
        { label: 'FURNITURE', categories: ['Furniture', 'Indoor Furniture'] },
        {
          label: 'BED & BATH',
          categories: ['Bed & Bath', 'Bedding'],
          search: 'bed',
        },
        {
          label: 'LIGHTING & DECOR',
          categories: ['Lighting & Decor', 'Home Decor', 'Decor'],
          search: 'decor',
        },
        {
          label: 'RUGS & PILLOWS',
          categories: ['Rugs & Pillows', 'Rugs'],
          search: 'rug',
        },
        {
          label: 'TABLETOP & ENTERTAINING',
          categories: ['Tabletop & Entertaining', 'Kitchen'],
          search: 'tabletop',
        },
        {
          label: 'HOLIDAY DECOR & GIFTS',
          categories: [
            'Holiday Decor & Gifts',
            'Gifts & Celebrations',
            'Seasonal',
          ],
          search: 'holiday',
        },
        {
          label: 'CLEARANCE',
          categories: ['Clearance'],
          search: 'clearance',
          emphasis: true,
        },
      ],
    },
    buttons: { transform: 'uppercase', radius: '0px' },
    features: { quickShop: true, swatchesOnCards: true },
    footer: {
      heading: 'A more beautiful everyday.',
      description:
        'Be the first to discover new collections, thoughtful inspiration and special offers.',
      columns: footerColumns,
    },
    promo: {
      headline: 'WELCOME TO FRONTGATE',
      detail: 'Discover the latest collection',
    },
    home: {
      eyebrow: 'THE ART OF LIVING WELL',
      headline: 'Make room for\n extraordinary.',
      description:
        'Beautifully crafted. Exceptionally comfortable.\nDiscover the pieces that bring a room to life.',
      cta: 'Shop the Collection',
      category: 'all-products',
      secondaryTitle: 'Beautiful living starts here.',
    },
    catalog: {
      title: 'All Products',
      description:
        'Beautifully considered spaces start with exceptional pieces. Discover timeless design, enduring materials and a seat for every moment.',
    },
    gallery: 'vertical',
    minicart: 'wide',
    pdp: {
      layout: 'frontgate',
      primary: '#252525',
      accent: '#252525',
      border: '#cccccc',
      surface: '#f4f4f4',
    },
  },
  gr: {
    key: 'gr',
    route: '/gr',
    storeKey: 'grandin-road',
    displayName: 'Grandin Road',
    wordmark: {
      asset: '/brands/gr/logo.svg',
      aspectRatio: '204.7 / 41.2',
      desktopWidth: '296px',
    },
    typography: {
      heading: '"Frank Ruhl Libre", Georgia, "Times New Roman", serif',
      body: '"Open Sans", Arial, Helvetica, sans-serif',
      tracking: '0.045em',
    },
    spacing: { page: '32px', section: '56px', grid: '24px' },
    colors: {
      primary: '#b94d2b',
      ink: '#262626',
      muted: '#686c69',
      wash: '#f7f7f5',
      promo: '#d9e5ec',
      logo: '#db734b',
    },
    header: {
      layout: 'search-right',
      searchPlaceholder: 'Search - Keyword or Item #',
      utility: ['Request a Catalog', 'Customer Service', 'Order Status'],
      border: '#d8d5d0',
      surface: '#f5f4f1',
      navigation: [
        { label: 'NEW', categories: ['New', 'New Arrivals'], search: 'new' },
        {
          label: 'HALLOWEEN HAVEN',
          categories: ['Halloween Haven', 'Halloween'],
          search: 'halloween',
        },
        { label: 'FURNITURE', categories: ['Furniture', 'Indoor Furniture'] },
        { label: 'DECOR', categories: ['Decor', 'Home Decor'] },
        { label: 'OUTDOOR', categories: ['Outdoor', 'Outdoor Living'] },
        {
          label: 'BEDDING',
          categories: ['Bedding', 'Bed & Bath'],
          search: 'bed',
        },
        {
          label: 'RUGS & LIGHTING',
          categories: ['Rugs & Lighting', 'Rugs'],
          search: 'rug',
        },
        { label: 'SEASONAL', categories: ['Seasonal', 'Gifts & Celebrations'] },
        { label: 'CHRISTMAS', categories: ['Christmas'] },
        { label: 'CLEARANCE', categories: ['Clearance'] },
      ],
      secondaryNavigation: [
        { label: 'Seasonal', categories: ['Seasonal', 'Gifts & Celebrations'] },
        {
          label: 'Halloween Haven',
          categories: ['Halloween Haven', 'Halloween'],
          search: 'halloween',
        },
        { label: 'Fall Decor' },
        { label: 'Christmas' },
        {
          label: 'Wreaths & Greenery',
          categories: ['Wreaths & Greenery', 'Wreaths'],
          search: 'wreath',
        },
        {
          label: 'Storage & Essentials',
          categories: ['Storage & Essentials', 'Storage'],
          search: 'storage',
        },
      ],
    },
    buttons: { transform: 'uppercase', radius: '0px' },
    features: { quickShop: true, swatchesOnCards: true },
    footer: {
      heading: 'Good things are coming your way.',
      description:
        'Fresh finds, feel-good inspiration and exclusive offers. Let’s make yourself at home.',
      columns: footerColumns,
    },
    promo: {
      headline: 'WELCOME TO GRANDIN ROAD',
      detail: 'Find something you love',
    },
    home: {
      eyebrow: 'A FRESH TAKE ON HOME',
      headline: 'A little unexpected.\nEntirely you.',
      description:
        'Color, character and comfort.\nFind the pieces that make your house feel like you.',
      cta: 'Shop the Collection',
      category: 'all-products',
      secondaryTitle: 'A home with personality.',
    },
    catalog: {
      title: 'All Products',
      description:
        'Your home. Your point of view. Find furniture that’s as full of personality as you are.',
    },
    gallery: 'vertical',
    minicart: 'compact',
    pdp: {
      layout: 'production',
      primary: '#193c56',
      accent: '#d77550',
      border: '#d8d5d0',
      surface: '#f5f4f1',
    },
  },
};

export function resolveBrand(pathname: string): BrandConfig | undefined {
  const key = pathname.split('/')[1];
  return key === 'fg' || key === 'gr' || key === 'gh' ? brands[key] : undefined;
}

// The legacy store selector and the server allowlist derive brand Stores from
// the same configuration used by /fg, /gr and /gh. Store keys are commercetools keys.
storefronts.push(
  ...Object.values(brands).map((store) => ({
    key: store.storeKey,
    name: store.displayName,
    brand: store.displayName,
    announcement: store.promo.detail,
    headline: [store.home.headline, ''] as [string, string],
    description: store.home.description,
    productLayout: 'grid' as const,
    productsPerRow: 4 as const,
    showProductDescription: false,
    theme: {
      primary: store.colors.primary,
      primaryHover: store.colors.primary,
      background: '#ffffff',
      surface: store.colors.wash,
      accent: store.colors.wash,
      text: store.colors.ink,
    },
    features: store.features,
  })),
);
