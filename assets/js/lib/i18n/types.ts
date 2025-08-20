/**
 * Types for type-safe i18n system
 */

export type Locale = 'en' | 'no';

// Define schema with required interpolation variables
export type TranslationValue =
  | string // No interpolation needed
  | { __interpolations: readonly string[] }; // Requires specific interpolations

export interface BaseTranslationSchema {
  [key: string]: TranslationValue | BaseTranslationSchema;
}

// Convert schema to dot notation keys
type DotNotationKeys<
  T,
  Prefix extends string = "",
  Depth extends readonly any[] = [],
> = Depth["length"] extends 4
  ? never
  : {
      [K in keyof T]: K extends string
        ? T[K] extends TranslationValue
          ? Prefix extends ""
            ? K
            : `${Prefix}.${K}`
          : T[K] extends BaseTranslationSchema
            ? Prefix extends ""
              ? K | DotNotationKeys<T[K], K, [...Depth, any]>
              :
                  | `${Prefix}.${K}`
                  | DotNotationKeys<T[K], `${Prefix}.${K}`, [...Depth, any]>
            : never
        : never;
    }[keyof T];

export type SchemaKeys<T> = DotNotationKeys<T>;

// Extract interpolation variables from schema
type ExtractInterpolations<T> = T extends {
  __interpolations: readonly (infer U)[];
}
  ? U extends string
    ? Record<U, string | number>
    : never
  : never;

// Get value type at specific path
type GetValueAtPath<
  T,
  P extends string,
> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? GetValueAtPath<T[Key], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Get required interpolations for a key
export type SchemaInterpolations<
  T,
  K extends SchemaKeys<T>,
> = ExtractInterpolations<GetValueAtPath<T, K>>;

// Convert schema to actual translation interface
export type TranslationFromSchema<T> = {
  [K in keyof T]: T[K] extends TranslationValue
    ? string
    : T[K] extends BaseTranslationSchema
      ? TranslationFromSchema<T[K]>
      : never;
};