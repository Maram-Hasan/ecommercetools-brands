import {
  Router,
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express';
import { commerce } from './commercetools/service.js';
import { cartView } from './commercetools/mappers/cart.mapper.js';
import { config } from './config.js';
import { defaultStoreKey, isStoreKey } from './stores.js';
import { ApiError } from './errors.js';

const cartCookie = (storeKey: string) => `storefront_cart_${storeKey}`;
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/api',
  maxAge: 7 * 86400_000,
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function status(error: unknown): number {
  return typeof error === 'object' && error && 'statusCode' in error
    ? Number(error.statusCode)
    : 500;
}

function id(value: unknown): string {
  if (typeof value !== 'string' || !uuid.test(value))
    throw new ApiError(400, 'Invalid resource ID.');
  return value;
}

function quantity(value: unknown, min: number): number {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > 99) {
    throw new ApiError(
      400,
      `Quantity must be a whole number between ${min} and 99.`,
    );
  }
  return Number(value);
}

async function currentCart(req: Request, res: Response, storeKey: string) {
  const cookieName = cartCookie(storeKey);
  const cartId = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  if (!cartId || !uuid.test(cartId)) return null;
  try {
    const cart = await commerce.cart(cartId, storeKey);
    if (
      cart.cartState === 'Active' &&
      cart.store?.key === storeKey &&
      cart.totalPrice.currencyCode === config.currency &&
      cart.country === config.country
    )
      return cart;
  } catch (error) {
    if (status(error) !== 404) throw error;
  }
  res.clearCookie(cookieName, { path: '/api' });
  return null;
}

export function createApiRouter() {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  router.use((req, res, next) => {
    const storeKey = req.query.store ?? defaultStoreKey;
    if (typeof storeKey !== 'string' || !isStoreKey(storeKey)) {
      throw new ApiError(
        400,
        'Unknown Store. Select one of the configured storefronts.',
      );
    }
    res.locals.storeKey = storeKey;
    next();
  });
  router.get('/products', async (req, res) => {
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isInteger(offset) || offset < 0 || offset > 10000)
      throw new ApiError(400, 'Invalid page offset.');
    res.json(await commerce.products(offset, res.locals.storeKey));
  });
  router.get('/products/by-slug/:slug', async (req, res) => {
    const slug = req.params.slug;
    if (
      typeof slug !== 'string' ||
      !slug.trim() ||
      slug.length > 256 ||
      /[\/\\]/.test(slug)
    )
      throw new ApiError(400, 'Invalid product slug.');
    res.json(await commerce.productBySlug(slug, res.locals.storeKey));
  });
  router.get('/products/:id', async (req, res) => {
    res.json(await commerce.product(id(req.params.id), res.locals.storeKey));
  });
  router.get('/cart', async (req, res) => {
    const cart = await currentCart(req, res, res.locals.storeKey);
    res.json(cart ? cartView(cart, config.locale) : null);
  });
  router.post('/cart/items', async (req, res) => {
    const productId = id(req.body?.productId);
    const count = quantity(req.body?.quantity ?? 1, 1);
    const variantId = req.body?.variantId;
    if (!Number.isInteger(variantId) || variantId < 1)
      throw new ApiError(400, 'Invalid variant.');
    const storeKey = res.locals.storeKey as string;
    const product = await commerce.product(productId, storeKey);
    if (
      !product.variants.some(
        (variant) => variant.id === variantId && variant.price,
      )
    ) {
      throw new ApiError(
        400,
        'This variant is not available to purchase in this Store.',
      );
    }
    let cart = await currentCart(req, res, storeKey);
    if (!cart) {
      cart = await commerce.createCart(storeKey);
      res.cookie(cartCookie(storeKey), cart.id, cookieOptions);
    }
    const existing = cart.lineItems.find(
      (item) => item.productId === productId && item.variant.id === variantId,
    );
    if ((existing?.quantity ?? 0) + count > 99)
      throw new ApiError(400, 'A maximum of 99 per item is supported.');
    const updated = await commerce.updateCart(
      cart.id,
      cart.version,
      {
        action: 'addLineItem',
        productId,
        variantId,
        quantity: count,
      },
      storeKey,
    );
    res.json(cartView(updated, config.locale));
  });
  router.patch('/cart/items/:id', async (req, res) => {
    const lineItemId = id(req.params.id);
    const count = quantity(req.body?.quantity, 0);
    const storeKey = res.locals.storeKey as string;
    const cart = await currentCart(req, res, storeKey);
    if (!cart)
      throw new ApiError(
        404,
        'Your cart expired. Add a product to start a new cart.',
      );
    if (!cart.lineItems.some((item) => item.id === lineItemId))
      throw new ApiError(404, 'This item is no longer in your cart.');
    const updated = await commerce.updateCart(
      cart.id,
      cart.version,
      {
        action: 'changeLineItemQuantity',
        lineItemId,
        quantity: count,
      },
      storeKey,
    );
    res.json(cartView(updated, config.locale));
  });
  router.use((_req, res) => {
    res.status(404).json({ message: 'API route not found.' });
  });
  return router;
}

export const apiErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  let code = status(error);
  const errors = error?.body?.errors ?? error?.errors ?? [];
  let message =
    'Could not reach commercetools. Check the server configuration and try again.';
  if (error instanceof ApiError) message = error.message;
  else if (error instanceof SyntaxError) {
    code = 400;
    message = 'Invalid JSON request.';
  } else if (code === 401 || code === 403)
    message =
      'Commercetools access was denied. Check the server credentials and API client scopes.';
  else if (code === 404)
    message = 'This product or cart is no longer available.';
  else if (code === 409)
    message = 'Your cart changed in another tab. Please try again.';
  else if (
    errors.some(
      (item: { code?: string }) => item.code === 'MatchingPriceNotFound',
    )
  )
    message =
      'No price is available for this variant in the configured currency and country.';
  else if (code === 400)
    message =
      'Commercetools could not apply this change. Check the product price and cart configuration.';
  else if (code === 429)
    message = 'Too many requests. Please wait a moment and try again.';
  if (!Number.isInteger(code) || code < 400 || code > 599) code = 500;
  // Never serialize SDK errors: they may contain authorization headers or credentials.
  console.error(`Storefront API error (${code})`);
  res.status(code).json({ message });
};
