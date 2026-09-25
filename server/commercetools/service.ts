import type { CartUpdateAction } from '@commercetools/platform-sdk';
import { apiRoot } from './client.js';
import { config } from '../config.js';
import { productView } from './mappers.js';
import { loadStore, storeChannels } from './stores.js';
import { ApiError } from '../errors.js';
import { logCatalog, selectionProducts } from './catalog.js';

const projection = {
  staged: false,
  expand: ['categories[*]', 'categories[*].ancestors[*]'],
  priceCurrency: config.currency,
  ...(config.country ? { priceCountry: config.country } : {}),
};

export const commerce = {
  async products(offset: number, storeKey: string) {
    logCatalog('request', { storeKey, offset });
    const store = await loadStore(storeKey);
    const { distributionChannelId, supplyChannelId } = storeChannels(store);
    const priceContext = {
      priceCurrency: config.currency,
      ...(config.country ? { priceCountry: config.country } : {}),
      ...(distributionChannelId ? { priceChannel: distributionChannelId } : {}),
    };
    if (
      store.productSelections.some((setting) => !setting.productSelection.obj)
    ) {
      throw new ApiError(
        403,
        'Cannot read Product Selection metadata. The API client needs view_product_selections for this Project.',
      );
    }
    const activeSelections = store.productSelections.filter(
      (setting) => setting.active,
    );
    if (
      activeSelections.some(
        (setting) =>
          setting.productSelection.obj?.mode === 'IndividualExclusion',
      )
    ) {
      throw new ApiError(
        501,
        'This local catalog supports Inclusion Product Selections. Active Exclusion Product Selections need a separate catalog query.',
      );
    }
    const hasInclusionSelection = store.productSelections.some(
      (setting) => setting.productSelection.obj?.mode === 'Individual',
    );
    if (hasInclusionSelection) {
      const available = await selectionProducts(storeKey, priceContext);
      const products = available
        .slice(offset, offset + 24)
        .map((product) => productView(product, config.locale, supplyChannelId));
      logCatalog('response', {
        storeKey,
        returnedCount: products.length,
        total: available.length,
        products: products.map((product) => ({
          id: product.id,
          key: product.key,
          skus: product.variants.map((variant) => variant.sku),
        })),
      });
      return { products, total: available.length, offset, limit: 24 };
    }
    // A Store without Inclusion selections still exposes its complete catalog.
    const { body } = await apiRoot
      .productProjections()
      .get({
        queryArgs: {
          ...projection,
          storeProjection: storeKey,
          ...(distributionChannelId
            ? { priceChannel: distributionChannelId }
            : {}),
          offset,
          limit: 24,
          sort: ['id asc'],
        },
      })
      .execute();
    logCatalog('response', {
      storeKey,
      returnedCount: body.results.length,
      total: body.total,
      products: body.results.map((product) => ({
        id: product.id,
        key: product.key,
        skus: [product.masterVariant, ...product.variants].map(
          (variant) => variant.sku,
        ),
      })),
    });
    return {
      products: body.results.map((product) =>
        productView(product, config.locale, supplyChannelId),
      ),
      total: body.total ?? body.count,
      offset: body.offset,
      limit: body.limit,
    };
  },

  async product(id: string, storeKey: string) {
    const { distributionChannelId, supplyChannelId } = storeChannels(
      await loadStore(storeKey),
    );
    const { body } = await apiRoot
      .inStoreKeyWithStoreKeyValue({ storeKey })
      .productProjections()
      .withId({ ID: id })
      .get({
        queryArgs: {
          ...projection,
          ...(distributionChannelId
            ? { priceChannel: distributionChannelId }
            : {}),
        },
      })
      .execute();
    return productView(body, config.locale, supplyChannelId);
  },

  async cart(id: string, storeKey: string) {
    return (
      await apiRoot
        .inStoreKeyWithStoreKeyValue({ storeKey })
        .carts()
        .withId({ ID: id })
        .get()
        .execute()
    ).body;
  },

  async createCart(storeKey: string) {
    return (
      await apiRoot
        .inStoreKeyWithStoreKeyValue({ storeKey })
        .carts()
        .post({
          body: {
            currency: config.currency,
            ...(config.country ? { country: config.country } : {}),
            inventoryMode: 'None',
            taxMode: 'Disabled',
            deleteDaysAfterLastModification: 7,
          },
        })
        .execute()
    ).body;
  },

  async updateCart(
    id: string,
    version: number,
    action: CartUpdateAction,
    storeKey: string,
  ) {
    if (action.action === 'addLineItem') {
      const { distributionChannelId, supplyChannelId } = storeChannels(
        await loadStore(storeKey),
      );
      action = {
        ...action,
        ...(distributionChannelId
          ? {
              distributionChannel: {
                typeId: 'channel',
                id: distributionChannelId,
              },
            }
          : {}),
        ...(supplyChannelId
          ? { supplyChannel: { typeId: 'channel', id: supplyChannelId } }
          : {}),
      };
    }
    return (
      await apiRoot
        .inStoreKeyWithStoreKeyValue({ storeKey })
        .carts()
        .withId({ ID: id })
        .post({ body: { version, actions: [action] } })
        .execute()
    ).body;
  },
};
