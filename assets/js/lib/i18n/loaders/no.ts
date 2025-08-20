/**
 * Norwegian translation loader
 */

import type { TranslationFromSchema, BaseTranslationSchema } from '../types';
import noTranslations from '../translations/no';

/**
 * Synchronously get Norwegian translations
 */
export function getNoSync<T extends BaseTranslationSchema>(): TranslationFromSchema<T> | null {
  try {
    return noTranslations as TranslationFromSchema<T>;
  } catch {
    return null;
  }
}