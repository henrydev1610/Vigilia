import React from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';
import { AppText } from '../ui';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected = false, onPress }) => {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? styles.chipSelected : null]}>
      <AppText
        weight={selected ? 'medium' : 'regular'}
        style={[styles.label, { color: selected ? designSystem.colors.greenLight : designSystem.colors.textMuted }]}
      >
        {label}
      </AppText>
      <Icon
        name="chevron-down"
        size={15}
        color={selected ? designSystem.colors.greenLight : designSystem.colors.textMuted}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: designSystem.radius.chip,
    backgroundColor: designSystem.colors.chip,
    borderWidth: 1,
    borderColor: 'rgba(143, 233, 168, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: 8,
    gap: 2,
  },
  chipSelected: {
    backgroundColor: designSystem.colors.chipSelected,
    borderColor: 'rgba(23, 217, 104, 0.5)',
  },
  label: {
    fontSize: designSystem.typography.sizes.bodySm,
    lineHeight: designSystem.typography.lineHeights.bodySm,
  },
});
