export const colors = {
  // Primary (Hindustan Orange)
  primary: {
    main: '#E67E22',
    light: '#F39C12',
    dark: '#D35400',
    contrast: '#FFFFFF',
  },
  
  // Accent (Verification Green)
  accent: {
    main: '#27AE60',
    light: '#2ECC71',
    muted: '#A9DFBF',
    contrast: '#FFFFFF',
  },
  
  // Neutral
  neutral: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    border: '#E8E5E0',
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    textMuted: '#BDC3C7',
  },
  
  // State
  state: {
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  },
  
  // Functional
  functional: {
    disabled: '#BDC3C7',
    placeholder: '#BDC3C7',
    focus: '#E67E22',
  },
} as const;

export type ColorToken = keyof typeof colors;
