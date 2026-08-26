import { Platform } from 'react-native';

export const typography = {
  // Font families
  fonts: {
    display: Platform.select({
      ios: 'PlayfairDisplay-Bold',
      android: 'PlayfairDisplay-Bold',
      default: 'Georgia',
    }),
    body: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: 'System',
    }),
    bodyBold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'System',
    }),
    utility: Platform.select({
      ios: 'JetBrainsMono-Regular',
      android: 'JetBrainsMono-Regular',
      default: 'monospace',
    }),
  },
  
  // Font sizes
  sizes: {
    hero: 32,
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    bodyLarge: 16,
    body: 14,
    caption: 12,
    small: 11,
    price: 18,
  },
  
  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.25,
    wider: 0.3,
  },
} as const;

export type TypographyToken = keyof typeof typography;
