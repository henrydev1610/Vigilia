import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme';

interface IconButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  tone?: 'default' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onPress, tone = 'default' }) => {
  const theme = useAppTheme();
  const color = tone === 'danger' ? theme.colors.danger : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={18} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});

