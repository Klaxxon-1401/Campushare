export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { borders } from './borders';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borders } from './borders';

export const theme = {
  colors,
  typography,
  spacing,
  borders,
} as const;

export type Theme = typeof theme;
