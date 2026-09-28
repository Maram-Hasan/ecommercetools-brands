export type MobileFacet = {
  name: string;
  choices: { value: string; label: string; swatch?: string }[];
  selected: string[];
  onChange: (value: string) => void;
  type?: 'checkbox' | 'radio';
};

export type MobileFilterProps = {
  sort: string;
  onSort: (value: string) => void;
  facets: MobileFacet[];
  count: number;
  onReset: () => void;
  stock?: { selected: boolean; onChange: (selected: boolean) => void };
  priceRange?: {
    minimum: number;
    maximum: number;
    lower: number;
    upper: number;
    currency: string;
    onMinimum: (value: number) => void;
    onMaximum: (value: number) => void;
  };
};
