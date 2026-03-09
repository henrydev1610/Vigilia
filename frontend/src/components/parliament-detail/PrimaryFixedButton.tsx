import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

interface PrimaryFixedButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const PrimaryFixedButton: React.FC<PrimaryFixedButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.colors.primary, shadowColor: theme.shadow.card.shadowColor },
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Icon name="file-document-outline" size={18} color={theme.colors.textInverse} />
      <Text style={[styles.label, { color: theme.colors.textInverse }]}>Ver Nota Fiscal Selecionada</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 56,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.996 }],
  },
});
