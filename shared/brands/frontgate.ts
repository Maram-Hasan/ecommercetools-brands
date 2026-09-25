import type { BrandConfig } from './types.js';
import { footerColumns } from './footer.js';

export const fg: BrandConfig = {
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
  minicart: 'wide',
  pdp: {
    purchase: 'tiles',
    primary: '#252525',
    accent: '#252525',
    border: '#cccccc',
    surface: '#f4f4f4',
  },
};
