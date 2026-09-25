import type { ProductProjection } from '@commercetools/platform-sdk';
import { apiRoot } from './client.js';
import { config } from '../config.js';
import { ApiError } from '../errors.js';

export function logCatalog(event: string, details: Record<string, unknown>) {
  if (config.debugProducts) {
    // Temporary diagnostics: explicit catalog fields only, never SDK errors/tokens.
    console.info(`[catalog] ${JSON.stringify({ event, ...details })}`);
  }
}

export async function selectionProducts(
  storeKey: string,
  priceContext: {
    priceCurrency: string;
    priceCountry?: string;
    priceChannel?: string;
  },
): Promise<ProductProjection[]> {
  const inStore = apiRoot.inStoreKeyWithStoreKeyValue({ storeKey });
  const productIds = new Set<string>();
  let assignmentCount = 0;
  let reportedTotal: number | undefined;

  // The assignments API can contain a product more than once when active
  // selections overlap. Read every assignment page before deduplicating.
  for (let offset = 0; ; offset += 500) {
    if (offset > 10000) {
      throw new ApiError(
        400,
        'This Store exceeds the assignment API pagination limit supported by this local demo.',
      );
    }
    const { body } = await inStore
      .productSelectionAssignments()
      .get({
        queryArgs: { limit: 500, offset, withTotal: true },
      })
      .execute();
    reportedTotal = body.total;
    assignmentCount += body.results.length;
    for (const assignment of body.results)
      productIds.add(assignment.product.id);
    if (body.results.length < 500) break;
  }

  logCatalog('active-selection-assignments', {
    storeKey,
    assignmentCount,
    reportedTotal,
    uniqueProductCount: productIds.size,
  });

  const ids = [...productIds].sort();
  const products: ProductProjection[] = [];
  // Store projections are the authority for publication, Store availability,
  // and allowed variants. Limit concurrent SDK calls for this small POC.
  for (let offset = 0; offset < ids.length; offset += 8) {
    const batch = await Promise.all(
      ids.slice(offset, offset + 8).map(async (id) => {
        try {
          return (
            await inStore
              .productProjections()
              .withId({ ID: id })
              .get({
                queryArgs: {
                  staged: false,
                  ...priceContext,
                  expand: ['categories[*]', 'categories[*].ancestors[*]'],
                },
              })
              .execute()
          ).body;
        } catch (error) {
          if (
            typeof error === 'object' &&
            error &&
            'statusCode' in error &&
            error.statusCode === 404
          ) {
            logCatalog('unavailable-store-product', {
              storeKey,
              productId: id,
            });
            return null;
          }
          throw error;
        }
      }),
    );
    for (const product of batch) if (product) products.push(product);
  }
  return products;
}
