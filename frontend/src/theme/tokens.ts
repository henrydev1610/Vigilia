import { ColorSchemeName } from 'react-native';
import { brandLightGreen } from './brand';

export type AppThemeMode = 'light' | 'dark';

export interface AppThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceAlt: string;
  surfaceMuted: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  danger: string;
  warning: string;
  success: string;
  brandLightGreen: string;
  overlay: string;
}

export interface AppThemeTypography {
  fontFamily: {
    body: string;
    bodyMedium: string;
    heading: string;
    headingBold: string;
  };
  size: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    label: number;
  };
  lineHeight: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    label: number;
  };
}

export interface AppTheme {
  mode: AppThemeMode;
  colors: AppThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  borderWidth: {
    thin: number;
    regular: number;
  };
  opacity: {
    disabled: number;
    subtle: number;
  };
  shadow: {
    card: {
      shadowColor: string;
      shadowOpacity: number;
      shadowOffset: { width: number; height: number };
      shadowRadius: number;
      elevation: number;
    };
  };
  typography: AppThemeTypography;
  gradients: {
    hero: readonly [string, string, string];
  };
}

const typography: AppThemeTypography = {
  fontFamily: {
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    heading: 'Sora_600SemiBold',
    headingBold: 'Sora_700Bold',
  },
  size: {
    h1: 32,
    h2: 24,
    h3: 18,
    body: 14,
    caption: 12,
    label: 13,
  },
  lineHeight: {
    h1: 36,
    h2: 28,
    h3: 22,
    body: 20,
    caption: 16,
    label: 18,
  },
};

const base = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  borderWidth: {
    thin: 1,
    regular: 1.5,
  },
  opacity: {
    disabled: 0.6,
    subtle: 0.82,
  },
  typography,
  gradients: {
    hero: ['#0E1911', '#0A0F0A', '#132116'] as const,
  },
};

const darkTheme: AppTheme = {
  mode: 'dark',
  ...base,
  colors: {
    background: '#0A0F0A',
    backgroundElevated: '#0D140E',
    surface: '#0F1A12',
    surfaceAlt: '#122016',
    surfaceMuted: '#17271B',
    primary: '#22C55E',
    primaryStrong: '#16A34A',
    primarySoft: 'rgba(34, 197, 94, 0.14)',
    text: '#E7F3EA',
    textSecondary: '#9FB7A5',
    textMuted: '#7D9583',
    border: 'rgba(34,197,94,0.18)',
    borderStrong: 'rgba(34,197,94,0.28)',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    brandLightGreen,
    overlay: 'rgba(4,8,5,0.62)',
  },
  shadow: {
    card: {
      shadowColor: '#22C55E',
      shadowOpacity: 0.14,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 18,
      elevation: 6,
    },
  },
};

const lightTheme: AppTheme = {
  mode: 'light',
  ...base,
  colors: {
    background: '#F4FBF6',
    backgroundElevated: '#ECF7EF',
    surface: '#FFFFFF',
    surfaceAlt: '#F7FCF8',
    surfaceMuted: '#EDF7F0',
    primary: '#16A34A',
    primaryStrong: '#15803D',
    primarySoft: 'rgba(21, 128, 61, 0.1)',
    text: '#102114',
    textSecondary: '#3B5A43',
    textMuted: '#6D8474',
    border: 'rgba(21,128,61,0.22)',
    borderStrong: 'rgba(21,128,61,0.34)',
    danger: '#DC2626',
    warning: '#D97706',
    success: '#16A34A',
    brandLightGreen,
    overlay: 'rgba(8, 20, 11, 0.2)',
  },
  shadow: {
    card: {
      shadowColor: '#15803D',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 5,
    },
  },
};

export function resolveTheme(mode: ColorSchemeName): AppTheme {
  return mode === 'light' ? lightTheme : darkTheme;
}

export const fallbackFonts = {
  body: 'System',
  bodyMedium: 'System',
  heading: 'System',
  headingBold: 'System',
} as const;


