import React from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useAppTheme, useDesignSystem } from '../../theme';
import { AppText } from '../ui';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected = false, onPress }) => {
  const designSystem = useDesignSystem();
  const theme = useAppTheme();
  const activeText = selected ? designSystem.colors.greenLight : designSystem.colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? theme.colors.borderStrong : designSystem.colors.inputBorder,
          backgroundColor: selected ? designSystem.colors.chipSelected : designSystem.colors.chip,
        },
      ]}
    >
      <AppText weight={selected ? 'medium' : 'regular'} style={[styles.label, { color: activeText }]}>
        {label}
      </AppText>
      <Icon name="chevron-down" size={15} color={activeText} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 15,
  },
});
