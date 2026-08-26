export const borders = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 20,
    full: 9999,
  },
  
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 3,
  },
} as const;

export type BorderToken = keyof typeof borders;
