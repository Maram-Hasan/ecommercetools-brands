export type StorefrontRoute =
  | { page: 'home' | 'cart' | 'checkout' | 'not-found' }
  | { page: 'product'; slug: string }
  | { page: 'category'; slug: string; search: string };
export function parseRoute(location: string): StorefrontRoute {
  const [pathname, search = ''] = location.split('?');
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return { page: 'home' };
  if (!['fg', 'gr', 'gh'].includes(parts[0])) return { page: 'not-found' };
  if (parts.length === 1) return { page: 'home' };
  const page = parts[1];
  if (parts.length === 2 && (page === 'cart' || page === 'checkout'))
    return { page };
  if (parts.length === 3 && (page === 'category' || page === 'product')) {
    try {
      const slug = decodeURIComponent(parts[2]);
      if (!slug || /[\/\\]/.test(slug)) return { page: 'not-found' };
      return page === 'category' ? { page, slug, search } : { page, slug };
    } catch {
      return { page: 'not-found' };
    }
  }
  return { page: 'not-found' };
}
