// Shared validation helpers / constants for API controllers.

export const CATEGORIES = ['academic', 'clothing', 'electronics', 'fitness', 'other'] as const;

export type Category = (typeof CATEGORIES)[number];

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Express 5 types params as `string | string[]`; coerce to a safe string. */
export const paramId = (value: string | string[] | undefined): string =>
  typeof value === 'string' ? value : '';