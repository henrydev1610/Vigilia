import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'default' }) => {
  const theme = useAppTheme();

  const toneColors = {
    default: { bg: theme.colors.surfaceMuted, fg: theme.colors.textSecondary },
    success: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    warning: { bg: 'rgba(245,158,11,0.14)', fg: theme.colors.warning },
    danger: { bg: 'rgba(239,68,68,0.14)', fg: theme.colors.danger },
  } as const;

  const palette = toneColors[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: theme.colors.border }]}> 
      <Text
        style={{
          color: palette.fg,
          fontSize: theme.typography.size.caption,
          lineHeight: theme.typography.lineHeight.caption,
          fontFamily: fallbackFonts.bodyMedium,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

