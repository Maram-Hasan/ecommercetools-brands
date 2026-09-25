import type { Money } from '../../shared/domain/money';
export function formatPrice(price: Money | null | undefined) {
  return price
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: price.currencyCode,
      }).format(price.amount / 10 ** price.fractionDigits)
    : 'Price unavailable';
}
