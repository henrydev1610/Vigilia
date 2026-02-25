import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { colors, radii, spacing, typography } from '../theme';

interface CategoryBarProps {
  label: string;
  value: string;
  progress: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ label, value, progress }) => {
  const normalized = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Progress.Bar
        progress={normalized}
        width={null}
        borderWidth={0}
        color={colors.greenBright}
        unfilledColor={colors.progressBg}
        borderRadius={radii.full}
        height={6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
