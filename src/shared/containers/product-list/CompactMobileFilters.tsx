import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/primitives';
import type { MobileFacet, MobileFilterProps } from './mobile-filters';

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M2 5h20M2 12h20M2 19h20" />
      <circle cx="8" cy="5" r="2" fill="white" />
      <circle cx="16" cy="12" r="2" fill="white" />
      <circle cx="8" cy="19" r="2" fill="white" />
    </svg>
  );
}

function StockToggle({ stock }: Pick<MobileFilterProps, 'stock'>) {
  return (
    <label className="compact-stock-toggle">
      <input
        type="checkbox"
        role="switch"
        checked={stock?.selected ?? false}
        onChange={(event) => stock?.onChange(event.target.checked)}
      />
      <span aria-hidden="true" />
      In-Stock
    </label>
  );
}

function Choices({ facet }: { facet?: MobileFacet }) {
  return (
    <div className="compact-filter-choices">
      {facet?.choices.map((choice) => (
        <label key={choice.value}>
          <input
            type={facet.type ?? 'checkbox'}
            name={`compact-${facet.name}`}
            checked={facet.selected.includes(choice.value)}
            onChange={() => facet.onChange(choice.value)}
          />
          {choice.label}
        </label>
      ))}
      {!facet?.choices.length && <p>No options available.</p>}
    </div>
  );
}

export function CompactMobileFilters(props: MobileFilterProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className="compact-mobile-filters">
      <button
        className="button secondary compact-filter-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <FilterIcon /> Filter &amp; Sort
      </button>
      <div className="compact-mobile-filter-status">
        <StockToggle stock={props.stock} />
        <span>{props.count} Items</span>
      </div>
      {open && <FilterDialog {...props} onClose={close} />}
    </div>
  );
}

function FilterDialog({
  sort,
  onSort,
  stock,
  facets,
  priceRange,
  count,
  onReset,
  onClose,
}: MobileFilterProps & { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const desktop = window.matchMedia('(min-width: 801px)');
    const closeOnDesktop = () => {
      if (desktop.matches) onClose();
    };
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    desktop.addEventListener('change', closeOnDesktop);
    closeOnDesktop();
    return () => {
      desktop.removeEventListener('change', closeOnDesktop);
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);
  const money = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: priceRange?.currency ?? 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  return (
    <dialog
      ref={ref}
      className="compact-filter-dialog"
      aria-label="Filter & Sort"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="compact-filter-content">
        <button
          className="icon-button compact-filter-close"
          aria-label="Close filter and sort"
          onClick={onClose}
          autoFocus
        >
          <Icon name="close" />
        </button>
        <div className="compact-filter-scroll">
          <div className="compact-filter-stock">
            <StockToggle stock={stock} />
            <small>Ships in 1-7 Business Days</small>
          </div>
          <fieldset className="compact-filter-sort">
            <legend>Sort By:</legend>
            {[
              ['featured', 'Recommended'],
              ['low', 'Price:(Low to High)'],
              ['high', 'Price:(High to Low)'],
              ['rating', 'Customer Ratings'],
              ['new', 'Newest'],
              ...(sort === 'name' ? [['name', 'Name: A to Z']] : []),
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="compact-sort"
                  value={value}
                  checked={sort === value}
                  onChange={() => onSort(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <h2 className="compact-filter-heading">
            <FilterIcon /> Filter
          </h2>
          <details className="compact-filter-facet">
            <summary>Type</summary>
            <Choices
              facet={facets.find((facet) => facet.name === 'Category')}
            />
          </details>
          <details className="compact-filter-facet">
            <summary>Price</summary>
            {priceRange ? (
              <div className="compact-price-range">
                <label>
                  Minimum price
                  <input
                    type="range"
                    min={priceRange.minimum}
                    max={priceRange.maximum}
                    value={priceRange.lower}
                    onChange={(event) =>
                      priceRange.onMinimum(Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Maximum price
                  <input
                    type="range"
                    min={priceRange.minimum}
                    max={priceRange.maximum}
                    value={priceRange.upper}
                    onChange={(event) =>
                      priceRange.onMaximum(Number(event.target.value))
                    }
                  />
                </label>
                <div>
                  <span>{money(priceRange.lower)}</span>
                  <span>{money(priceRange.upper)}</span>
                </div>
              </div>
            ) : (
              <Choices facet={facets.find((facet) => facet.name === 'Price')} />
            )}
          </details>
        </div>
        <div className="compact-filter-actions">
          <button className="button secondary" onClick={onReset}>
            Clear All
          </button>
          <button className="button" onClick={onClose}>
            View {count} ITEMS
          </button>
        </div>
      </div>
    </dialog>
  );
}
