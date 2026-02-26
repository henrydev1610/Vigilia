export const designSystem = {
  colors: {
    bg: '#06160F',
    card: '#0E2A1D',
    cardSecondary: '#143424',
    green: '#17D968',
    greenLight: '#8FE9A8',
    textPrimary: '#E9F7EE',
    textMuted: '#7FA28B',
    track: '#284A3A',
    warning: '#F48A1E',
    chip: '#123523',
    chipSelected: '#1B5733',
    inputBg: '#1A442D',
    inputBorder: 'rgba(143, 233, 168, 0.16)',
    tabInactive: '#8FA89B',
    iconCircle: '#12472B',
    iconAccent: '#2CF17A',
  },
  radius: {
    chip: 999,
    card: 18,
    input: 14,
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  typography: {
    sizes: {
      title: 42,
      heading: 31,
      body: 14,
      bodySm: 12,
      label: 11,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    } as const,
    lineHeights: {
      title: 52,
      heading: 38,
      body: 18,
      bodySm: 15,
      label: 14,
    },
  },
  shadow: {
    card: {
      shadowColor: '#000000',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
    },
  },
} as const;

export type DesignSystem = typeof designSystem;
