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
    layout: 'classic' | 'editorial';
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
  pdp: {
    purchase: 'swatches' | 'tiles';
    layout: 'production' | 'frontgate' | 'garnet-hill';
    addLabel?: string;
    primary: string;
    accent: string;
    border: string;
    surface: string;
  };
}
