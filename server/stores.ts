import { brands } from '../shared/brands/index.js';
import { storefronts, defaultStoreKey } from '../shared/legacy/storefronts.js';
// Both applications use the API; storefront configuration never depends on demo models.
export { defaultStoreKey };
const storeKeys = new Set([
  ...Object.values(brands).map((brand) => brand.storeKey),
  ...storefronts.map((store) => store.key),
]);
export const isStoreKey = (key: string) => storeKeys.has(key);
