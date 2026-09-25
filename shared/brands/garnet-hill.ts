import type { BrandConfig } from './types.js';

export const gh: BrandConfig = {
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
    layout: 'editorial',
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
    purchase: 'tiles',
    layout: 'garnet-hill',
    addLabel: 'ADD TO BAG',
    primary: '#716b61',
    accent: '#716b61',
    border: '#d5d0c9',
    surface: '#f5f3ef',
  },
};
