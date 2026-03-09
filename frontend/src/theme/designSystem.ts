import { useMemo } from 'react';
import { useAppTheme } from './useAppTheme';

export function useDesignSystem() {
  const theme = useAppTheme();

  return useMemo(() => ({
    colors: {
      bg: theme.colors.background,
      card: theme.colors.surface,
      cardSecondary: theme.colors.surfaceAlt,
      green: theme.colors.primary,
      greenLight: theme.colors.primaryStrong,
      textPrimary: theme.colors.text,
      textMuted: theme.colors.textMuted,
      track: theme.colors.surfaceStrong,
      warning: theme.colors.warning,
      chip: theme.colors.surfaceAlt,
      chipSelected: theme.colors.primarySoft,
      inputBg: theme.colors.inputBackground,
      inputBorder: theme.colors.inputBorder,
      tabInactive: theme.colors.tabIconInactive,
      iconCircle: theme.colors.iconCircle,
      iconAccent: theme.colors.iconAccent,
    },
    radius: {
      chip: theme.radius.pill,
      card: theme.radius.lg,
      input: theme.radius.md,
    },
    spacing: {
      xxs: 4,
      xs: theme.spacing.sm,
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
      xl: theme.spacing.xxl,
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
      card: theme.shadow.card,
    },
  }), [theme]);
}

export type DesignSystem = ReturnType<typeof useDesignSystem>;
