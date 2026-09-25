import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`Missing ${name}. Set it in .env (see .env.example).`);
  return value;
}

export const config = {
  projectKey: required('CTP_PROJECT_KEY'),
  clientId: required('CTP_CLIENT_ID'),
  clientSecret: required('CTP_CLIENT_SECRET'),
  authUrl: required('CTP_AUTH_URL'),
  apiUrl: required('CTP_API_URL'),
  scopes: required('CTP_SCOPES').split(/\s+/),
  currency: process.env.CTP_CURRENCY?.trim() || 'USD',
  country: process.env.CTP_COUNTRY?.trim() || undefined,
  locale: process.env.CTP_LOCALE?.trim() || 'en-US',
  port: Number(process.env.PORT || 5173),
  // Temporary catalog diagnostics are on in dev, and opt-in for npm start.
  debugProducts:
    process.env.CTP_DEBUG_PRODUCTS === 'true' ||
    (!process.argv.includes('--production') &&
      process.env.CTP_DEBUG_PRODUCTS !== 'false'),
};

if (!/^[A-Z]{3}$/.test(config.currency))
  throw new Error('CTP_CURRENCY must be a three-letter currency code.');
if (config.country && !/^[A-Z]{2}$/.test(config.country))
  throw new Error('CTP_COUNTRY must be a two-letter country code.');
if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535)
  throw new Error('PORT must be between 1 and 65535.');
try {
  new Intl.DateTimeFormat(config.locale);
  for (const host of [config.authUrl, config.apiUrl]) {
    if (new URL(host).protocol !== 'https:') throw new Error();
  }
} catch {
  throw new Error(
    'Check CTP_LOCALE and the HTTPS CTP_AUTH_URL / CTP_API_URL in .env.',
  );
}
