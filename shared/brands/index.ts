import { fg } from './frontgate.js';
import { gr } from './grandin-road.js';
import { gh } from './garnet-hill.js';
import type { BrandConfig } from './types.js';
export type { BrandConfig } from './types.js';
export const brands = { fg, gr, gh };
export function resolveBrand(pathname: string): BrandConfig | undefined {
  const key = pathname.split('/')[1];
  return key === 'fg' || key === 'gr' || key === 'gh' ? brands[key] : undefined;
}
