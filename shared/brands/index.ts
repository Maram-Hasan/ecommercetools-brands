import { fg } from './frontgate.js';
import { gr } from './grandin-road.js';
import { gh } from './garnet-hill.js';
import type { BrandConfig } from './types.js';
export type { BrandConfig } from './types.js';
export const brands = { fg, gr, gh };
export function resolveBrand(pathname: string): BrandConfig | undefined {
  return Object.values(brands).find(
    (brand) =>
      pathname === brand.route || pathname.startsWith(`${brand.route}/`),
  );
}
