import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';

interface MiniCardProps {
  label: string;
  title: string;
  subtitle: string;
  alertIcon?: boolean;
  alertColor?: string;
}

export const MiniCard: React.FC<MiniCardProps> = ({
  label,
  title,
  subtitle,
  alertIcon = false,
  alertColor = colors.alertRed,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.titleRow}>
        {alertIcon ? <Icon name="alert-circle" size={14} color={alertColor} /> : null}
        <Text style={[styles.title, alertIcon ? styles.alertTitle : styles.normalTitle]}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    flex: 1,
    padding: spacing.base,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  normalTitle: {
    color: colors.textPrimary,
  },
  alertTitle: {
    color: colors.alertRed,
  },
  subtitle: {
    color: colors.greenText,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
});
