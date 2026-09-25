import { ClientBuilder } from '@commercetools/ts-client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { config } from '../config.js';

const client = new ClientBuilder()
  .withProjectKey(config.projectKey)
  .withClientCredentialsFlow({
    host: config.authUrl,
    projectKey: config.projectKey,
    credentials: {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    },
    scopes: config.scopes,
    httpClient: fetch,
  })
  .withHttpMiddleware({
    host: config.apiUrl,
    httpClient: fetch,
    timeout: 20000,
  })
  .build();

export const apiRoot = createApiBuilderFromCtpClient(client).withProjectKey({
  projectKey: config.projectKey,
});
