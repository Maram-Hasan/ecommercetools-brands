import type { BrandConfig } from './types.js';
import { footerColumns } from './footer.js';

export const gr: BrandConfig = {
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
    layout: 'classic',
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
    purchase: 'swatches',
    layout: 'production',
    primary: '#193c56',
    accent: '#d77550',
    border: '#d8d5d0',
    surface: '#f5f4f1',
  },
};
