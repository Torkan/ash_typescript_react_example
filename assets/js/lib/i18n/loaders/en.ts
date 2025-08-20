/**
 * English translation loader
 */

import type { TranslationFromSchema, BaseTranslationSchema } from '../types';
import enTranslations from '../translations/en';

/**
 * Synchronously get English translations
 */
export function getEnSync<T extends BaseTranslationSchema>(): TranslationFromSchema<T> | null {
  try {
    return enTranslations as TranslationFromSchema<T>;
  } catch {
    return null;
  }
}