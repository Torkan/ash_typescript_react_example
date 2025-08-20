/**
 * Translation loader registry
 */

import type { Locale, TranslationFromSchema, BaseTranslationSchema } from '../types';
import { getEnSync } from './en';
import { getNoSync } from './no';

/**
 * Synchronous loader functions for each locale
 */
export const syncLoaders: Record<string, <T extends BaseTranslationSchema>() => TranslationFromSchema<T> | null> = {
  en: getEnSync,
  no: getNoSync,
};

/**
 * Get list of available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(syncLoaders) as Locale[];
}

/**
 * Check if a locale has a loader
 */
export function hasLoader(locale: Locale): boolean {
  return locale in syncLoaders;
}

/**
 * Get a translation synchronously
 */
export function getTranslationSync<T extends BaseTranslationSchema>(
  locale: Locale
): TranslationFromSchema<T> | null {
  const loader = syncLoaders[locale];
  
  if (!loader) {
    console.warn(`No sync loader found for locale: ${locale}`);
    return null;
  }

  try {
    const translation = loader<T>();
    return translation;
  } catch (error) {
    console.warn(`Failed to get translation sync: ${locale}`, error);
    return null;
  }
}