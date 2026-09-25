import { useState, type FormEvent } from 'react';
import { useBrand } from '../../brands/context';
import { navigate } from '../../app/router';
import { Icon } from '../../components/Primitives';

export function Search({ onSearch }: { onSearch?: () => void }) {
  const brand = useBrand();
  const [query, setQuery] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(
      `${brand.route}/category/all-products?q=${encodeURIComponent(query.trim())}`,
    );
    onSearch?.();
  }
  return (
    <form className="site-search" role="search" onSubmit={submit}>
      <input
        type="search"
        aria-label="Search products"
        placeholder={brand.header.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button aria-label="Submit search">
        <Icon name="search" size={20} />
      </button>
    </form>
  );
}
