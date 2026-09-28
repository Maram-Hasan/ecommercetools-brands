import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../../../shared/components/primitives';
import type { MobileFilterProps } from '../../../shared/containers/product-list/mobile-filters';

export function FilterIcon() {
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
      <path d="M7 2v6M17 9v6M9 16v6" strokeWidth="3" />
    </svg>
  );
}

export function MobileFilterSort(props: MobileFilterProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        className="filter-toggle button secondary"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <FilterIcon /> Filter &amp; Sort
      </button>
      {open && <FilterDialog {...props} onClose={close} />}
    </>
  );
}

function FilterDialog({
  sort,
  onSort,
  facets,
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

  return (
    <dialog
      ref={ref}
      className="gh-mobile-filter-dialog"
      aria-label="Filter & Sort"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="gh-mobile-filter-content">
        <button
          className="icon-button gh-mobile-filter-close"
          aria-label="Close filter and sort"
          onClick={onClose}
          autoFocus
        >
          <Icon name="close" />
        </button>
        <div className="gh-mobile-filter-scroll">
          <fieldset className="gh-mobile-sort">
            <legend>Sort By:</legend>
            {[
              ['featured', 'Featured'],
              ['new', 'New Arrival'],
              ['top', 'Top Rated'],
              ['low', 'Price: Low to High'],
              ['rating', 'Rating: High to Low'],
              ...(sort === 'high' ? [['high', 'Price: High to Low']] : []),
              ...(sort === 'name' ? [['name', 'Name: A to Z']] : []),
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="gh-mobile-sort"
                  value={value}
                  checked={sort === value}
                  onChange={() => onSort(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <h2 className="gh-mobile-filter-heading">
            <FilterIcon /> Filter By:
          </h2>
          {facets.map((facet) => (
            <details className="gh-mobile-facet" key={facet.name}>
              <summary>{facet.name}</summary>
              <div className="gh-mobile-facet-choices">
                {facet.choices.length ? (
                  facet.choices.map((choice) => (
                    <label key={choice.value}>
                      <input
                        type={facet.type ?? 'checkbox'}
                        name={`gh-mobile-${facet.name}`}
                        checked={facet.selected.includes(choice.value)}
                        onChange={() => facet.onChange(choice.value)}
                      />
                      {choice.swatch && (
                        <span
                          className="gh-filter-swatch"
                          style={{ backgroundColor: choice.swatch }}
                          aria-hidden="true"
                        />
                      )}
                      {choice.label}
                    </label>
                  ))
                ) : (
                  <p>No options available.</p>
                )}
              </div>
            </details>
          ))}
        </div>
        <div className="gh-mobile-filter-actions">
          <button className="button secondary" onClick={onReset}>
            Clear All
          </button>
          <button className="button" onClick={onClose}>
            View {count} Items
          </button>
        </div>
      </div>
    </dialog>
  );
}
