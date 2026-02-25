import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress }) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surfaceAlt,
          borderColor: selected ? theme.colors.borderStrong : theme.colors.border,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? theme.colors.primary : theme.colors.textSecondary,
          fontSize: theme.typography.size.caption,
          lineHeight: theme.typography.lineHeight.caption,
          fontFamily: fallbackFonts.bodyMedium,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

