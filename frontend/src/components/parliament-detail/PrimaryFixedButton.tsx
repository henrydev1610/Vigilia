import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface PrimaryFixedButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const PrimaryFixedButton: React.FC<PrimaryFixedButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Icon name="file-document-outline" size={18} color="#052313" />
      <Text style={styles.label}>Ver Nota Fiscal Selecionada</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#1EE16C',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  label: {
    color: '#062415',
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
