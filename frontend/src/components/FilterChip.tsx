import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, active ? styles.activeContainer : styles.inactiveContainer]}
    >
      <View style={styles.content}>
        <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>{label}</Text>
        <Icon name="chevron-down" size={16} color={active ? colors.black : colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inactiveContainer: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderCard,
  },
  activeContainer: {
    backgroundColor: colors.greenBright,
    borderColor: colors.greenBright,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.sm,
  },
  inactiveText: {
    color: colors.textSecondary,
  },
  activeText: {
    color: colors.black,
    fontWeight: typography.fontWeight.bold,
  },
});
