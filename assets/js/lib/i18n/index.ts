/**
 * Simplified i18n - uses existing loaders, no global state, no client-side switching
 * Each page calls getI18n(locale) to get translation utilities for session locale
 */

import type { AppTranslationSchema } from './translation-schema';
import type { SchemaKeys } from './types';
import { getTranslationSync } from './loaders';

type Locale = 'en' | 'no';
type TranslationKeys = SchemaKeys<AppTranslationSchema>;

/**
 * Get i18n utilities for the given locale
 * Uses existing sync loaders - simple synchronous API
 */
export function getI18n(locale: string) {
  const validLocale: Locale = (locale === 'en' || locale === 'no') ? locale : 'en';
  
  // Use sync loader (has static imports as fallback)
  const localeTranslations = getTranslationSync<AppTranslationSchema>(validLocale);
  
  if (!localeTranslations) {
    console.error(`Failed to load translations for locale: ${validLocale}`);
    // Return fallback that shows keys
    return {
      t: (key: string) => key,
      locale: validLocale,
    };
  }
  
  return createTranslationUtils(validLocale, localeTranslations);
}

/**
 * Create translation utilities for a locale with loaded translations
 */
function createTranslationUtils(locale: Locale, localeTranslations: any) {
  /**
   * Translation function with type safety and interpolation
   */
  function t<K extends TranslationKeys>(
    key: K,
    params?: Record<string, string | number>
  ): string {
    // Navigate nested keys (e.g., "forms.userInformation")
    const keys = key.split('.');
    let current: any = localeTranslations;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to key if translation not found
        console.warn(`Translation key not found: ${key} for locale ${locale}`);
        return key;
      }
    }
    
    if (typeof current !== 'string') {
      console.warn(`Translation key ${key} did not resolve to string for locale ${locale}`);
      return key;
    }
    
    // Simple interpolation for {{variable}} patterns
    if (params) {
      return current.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return current;
  }
  
  return {
    t,
    locale,
  };
}

// Export types for convenience
export type { AppTranslationSchema };