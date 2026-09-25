import { createContext, useContext } from 'react';
import {
  defaultStoreKey,
  storefronts,
  type Storefront,
} from '../shared/storefronts';

export const StorefrontContext = createContext<Storefront>(storefronts[0]);
export const useStorefront = () => useContext(StorefrontContext);

export function selectedStoreKey() {
  return (
    new URLSearchParams(window.location.search).get('store') ?? defaultStoreKey
  );
}

export function switchStore(key: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('store', key);
  url.hash = '/';
  // A full navigation also cancels pending reads and resets variant/page state.
  window.location.assign(url.href);
}
