// Read-only Store discovery. Print public presentation and assignment metadata only.
import { apiRoot } from '../server/commercetools/client.js';
const response = await apiRoot.stores().get({ queryArgs: { limit: 100 } }).execute();
console.log(JSON.stringify(response.body.results.map(({ key, name, productSelections }) => ({
  key, name, selections: productSelections?.map(({ active }) => ({ active })),
})), null, 2));
