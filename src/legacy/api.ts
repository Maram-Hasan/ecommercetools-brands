import { commerceRequest } from '../services/commerce-client';
import { selectedStoreKey } from './storefront';
export function request<T>(path: string, options: RequestInit = {}) {
  return commerceRequest<T>(selectedStoreKey(), path, options);
}
