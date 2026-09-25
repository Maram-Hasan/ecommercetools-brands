import type { Store } from '@commercetools/platform-sdk';
import { apiRoot } from './client.js';
import { ApiError } from '../errors.js';

export async function loadStore(storeKey: string): Promise<Store> {
  return (
    await apiRoot
      .stores()
      .withKey({ key: storeKey })
      .get({
        queryArgs: { expand: ['productSelections[*].productSelection'] },
      })
      .execute()
  ).body;
}

// Both current Stores have at most one channel of each kind. Be explicit if
// a future Store needs a choice between multiple channels.
export function storeChannels(store: Store) {
  if (
    store.distributionChannels.length > 1 ||
    store.supplyChannels.length > 1
  ) {
    throw new ApiError(
      400,
      'This Store has multiple channels. Configure a specific channel selection in server/commercetools/stores.ts.',
    );
  }
  return {
    distributionChannelId: store.distributionChannels[0]?.id,
    supplyChannelId: store.supplyChannels[0]?.id,
  };
}
