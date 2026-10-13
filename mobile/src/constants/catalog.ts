import { Feather } from '@expo/vector-icons';
import { ItemCategory } from '../types';
import { CATEGORY_LABELS } from '../utils/format';

export interface CategoryOption {
  key: ItemCategory | 'all';
  label: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'all', label: 'All' },
  { key: 'academic', label: CATEGORY_LABELS.academic },
  { key: 'clothing', label: CATEGORY_LABELS.clothing },
  { key: 'electronics', label: CATEGORY_LABELS.electronics },
  { key: 'fitness', label: CATEGORY_LABELS.fitness },
  { key: 'other', label: CATEGORY_LABELS.other },
];

/** Category glyphs used in listing placeholder art. */
export const CATEGORY_ICONS: Record<ItemCategory, keyof typeof Feather.glyphMap> = {
  academic: 'book',
  clothing: 'shopping-bag',
  electronics: 'cpu',
  fitness: 'activity',
  other: 'package',
};

export const CAMPUS_LOCATIONS = [
  'North Campus',
  'South Dorms',
  'Central Library',
  'Engineering Block',
  'West Campus',
  'Sports Complex',
];

/**
 * Suggested deposit pre-fill: 10% of an item's brand-new value (PROJECT_PLAN §14).
 * The figures below are 10% of the category's typical replacement value; a
 * value-lookup API will replace this estimate later.
 */
export const SUGGESTED_DEPOSIT: Record<ItemCategory, number> = {
  academic: 30,
  clothing: 80,
  electronics: 150,
  fitness: 50,
  other: 25,
};

/** Suggested day-rate per category (PROJECT_PLAN §11.2). Always ≥ MIN_PRICE_PER_DAY. */
export const SUGGESTED_RATE: Record<ItemCategory, number> = {
  academic: 40,
  clothing: 120,
  electronics: 60,
  fitness: 50,
  other: 35,
};
