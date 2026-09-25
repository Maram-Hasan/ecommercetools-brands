import type { LocalizedString, TypedMoney } from '@commercetools/platform-sdk';
import type { Money } from '../../../shared/domain/money.js';
export function attributeText(value: unknown, locale: string): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value);
  if (Array.isArray(value))
    return value
      .map((item) => attributeText(item, locale))
      .filter(Boolean)
      .join(', ');
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    if ('label' in object) return attributeText(object.label, locale);
    // References and money/structured attributes are not display labels.
    if ('typeId' in object || 'currencyCode' in object) return '';
    if (Object.values(object).every((item) => typeof item === 'string'))
      return localize(object as LocalizedString, locale);
  }
  return '';
}

export function localize(
  value: LocalizedString | undefined,
  locale: string,
): string {
  if (!value) return '';
  const language = locale.split('-')[0];
  return (
    value[locale] ||
    value[language] ||
    Object.entries(value).find(
      ([key]) => key.split('-')[0] === language,
    )?.[1] ||
    Object.values(value)[0] ||
    ''
  );
}

export function money(value: TypedMoney): Money {
  return {
    amount:
      value.type === 'highPrecision' ? value.preciseAmount : value.centAmount,
    fractionDigits: value.fractionDigits,
    currencyCode: value.currencyCode,
  };
}
