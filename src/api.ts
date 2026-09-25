import { selectedStoreKey } from './storefront';

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = new URL(`/api${path}`, window.location.origin);
  url.searchParams.set('store', selectedStoreKey());
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.message || 'Something went wrong. Please try again.');
  return body as T;
}
