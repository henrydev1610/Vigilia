import { ColorSchemeName } from 'react-native';
import { brandLightGreen } from './brand';

export type AppThemeMode = 'light' | 'dark';

export interface AppThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceAlt: string;
  surfaceMuted: string;
  surfaceStrong: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  successSoft: string;
  brandLightGreen: string;
  overlay: string;
  gridLine: string;
  inputBackground: string;
  inputBorder: string;
  tabIconInactive: string;
  iconCircle: string;
  iconAccent: string;
  chartSurface: string;
  chartLine: string;
  chartAreaStart: string;
  chartAreaEnd: string;
  chartAxis: string;
  badgeNeutralBg: string;
  badgeNeutralText: string;
  badgeDangerBg: string;
  badgeDangerText: string;
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
    card: readonly [string, string];
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
    card: ['#142A20', '#101A17'] as const,
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
    surfaceStrong: '#1E3225',
    primary: '#22C55E',
    primaryStrong: '#16A34A',
    primarySoft: 'rgba(34, 197, 94, 0.14)',
    text: '#E7F3EA',
    textSecondary: '#9FB7A5',
    textMuted: '#7D9583',
    textInverse: '#07110B',
    border: 'rgba(34,197,94,0.18)',
    borderStrong: 'rgba(34,197,94,0.28)',
    danger: '#EF4444',
    dangerSoft: 'rgba(239,68,68,0.16)',
    warning: '#F59E0B',
    warningSoft: 'rgba(245,158,11,0.16)',
    success: '#22C55E',
    successSoft: 'rgba(34,197,94,0.14)',
    brandLightGreen,
    overlay: 'rgba(4,8,5,0.62)',
    gridLine: 'rgba(143, 233, 168, 0.045)',
    inputBackground: '#183225',
    inputBorder: 'rgba(143, 233, 168, 0.16)',
    tabIconInactive: '#8FA89B',
    iconCircle: '#12472B',
    iconAccent: '#2CF17A',
    chartSurface: '#0E2C1D',
    chartLine: '#1FE26C',
    chartAreaStart: 'rgba(36, 224, 111, 0.52)',
    chartAreaEnd: 'rgba(36, 224, 111, 0.04)',
    chartAxis: '#718F80',
    badgeNeutralBg: '#294234',
    badgeNeutralText: '#D9F1E2',
    badgeDangerBg: '#7E1C24',
    badgeDangerText: '#FFE6E6',
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
    background: '#EEF5F1',
    backgroundElevated: '#E7F1EB',
    surface: '#F7FCF9',
    surfaceAlt: '#F2F8F4',
    surfaceMuted: '#E4EFE8',
    surfaceStrong: '#D7E6DC',
    primary: '#16A34A',
    primaryStrong: '#15803D',
    primarySoft: 'rgba(21, 128, 61, 0.1)',
    text: '#18261E',
    textSecondary: '#3E5448',
    textMuted: '#667D71',
    textInverse: '#F5FCF7',
    border: 'rgba(33,85,53,0.17)',
    borderStrong: 'rgba(33,85,53,0.24)',
    danger: '#C43A44',
    dangerSoft: 'rgba(196,58,68,0.12)',
    warning: '#BF7A1A',
    warningSoft: 'rgba(191,122,26,0.14)',
    success: '#16A34A',
    successSoft: 'rgba(22,163,74,0.12)',
    brandLightGreen,
    overlay: 'rgba(14, 28, 20, 0.18)',
    gridLine: 'rgba(31, 84, 53, 0.075)',
    inputBackground: '#EDF5F0',
    inputBorder: 'rgba(33,85,53,0.2)',
    tabIconInactive: '#7B9386',
    iconCircle: '#D7E8DD',
    iconAccent: '#1C9E53',
    chartSurface: '#EDF6F0',
    chartLine: '#169A49',
    chartAreaStart: 'rgba(22, 154, 73, 0.28)',
    chartAreaEnd: 'rgba(22, 154, 73, 0.04)',
    chartAxis: '#789084',
    badgeNeutralBg: '#DBE9E1',
    badgeNeutralText: '#345042',
    badgeDangerBg: '#F4DEDF',
    badgeDangerText: '#8F2932',
  },
  shadow: {
    card: {
      shadowColor: '#15803D',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 3,
    },
  },
  gradients: {
    hero: ['#F4FBF7', '#EDF5F0', '#E6F0EA'] as const,
    card: ['#F7FCF9', '#ECF4EE'] as const,
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


