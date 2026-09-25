export async function commerceRequest<T>(
  storeKey: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = new URL(`/api${path}`, window.location.origin);
  url.searchParams.set('store', storeKey);
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.message || 'We couldn’t complete your request. Please try again.',
    );
  return data as T;
}
