import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';

interface StatCardProps {
  label: string;
  value: string;
  changePercent?: number;
  changeLabel?: string;
  icon?: React.ComponentProps<typeof Icon>['name'];
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  changePercent,
  changeLabel,
  icon,
}) => {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {icon ? (
          <View style={styles.decorativeIcon}>
            <Icon name={icon} size={20} color={colors.greenMuted} />
          </View>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      {typeof changePercent === 'number' ? (
        <View style={styles.badge}>
          <Icon
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={16}
            color={isPositive ? colors.greenBright : colors.alertRed}
          />
          <Text style={[styles.badgeText, isPositive ? styles.positiveText : styles.negativeText]}>
            {`${isPositive ? '+' : ''}${changePercent.toFixed(1)}% ${changeLabel ?? ''}`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    padding: spacing.base,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textLabel,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
    marginTop: spacing.xs,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCardLight,
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  positiveText: {
    color: colors.greenBright,
  },
  negativeText: {
    color: colors.alertRed,
  },
  decorativeIcon: {
    alignItems: 'center',
    backgroundColor: colors.bgCardLight,
    borderRadius: radii.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
