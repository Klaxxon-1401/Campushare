import { ItemCategory } from '../types';

/** "$10" for whole dollars, "$3.50" otherwise. */
export const formatMoney = (n: number): string =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  academic: 'Academic',
  clothing: 'Clothing',
  electronics: 'Electronics',
  fitness: 'Fitness',
  other: 'Other',
};

/** Emoji stand-in used while listings have no uploaded photos yet. */
export const CATEGORY_EMOJI: Record<ItemCategory, string> = {
  academic: '🔬',
  clothing: '🧥',
  electronics: '🧮',
  fitness: '🏋️',
  other: '📦',
};

export const categoryLabel = (c: ItemCategory): string => CATEGORY_LABELS[c];

export const titleCase = (s: string): string =>
  s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
