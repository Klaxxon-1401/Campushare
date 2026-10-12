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

export const CAMPUS_LOCATIONS = [
  'North Campus',
  'South Dorms',
  'Central Library',
  'Engineering Block',
  'West Campus',
  'Sports Complex',
];

/** Rough replacement-value guidance used to pre-fill the deposit field. */
export const SUGGESTED_DEPOSIT: Record<ItemCategory, number> = {
  academic: 10,
  clothing: 30,
  electronics: 50,
  fitness: 20,
  other: 15,
};

/** Suggested day-rate per category (PROJECT_PLAN §11.2). */
export const SUGGESTED_RATE: Record<ItemCategory, number> = {
  academic: 3,
  clothing: 8,
  electronics: 5,
  fitness: 4,
  other: 4,
};
