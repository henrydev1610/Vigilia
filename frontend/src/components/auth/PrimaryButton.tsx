import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PrimaryButtonProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export function PrimaryButton({ title, loading = false, disabled = false, onPress }: PrimaryButtonProps) {
  const blocked = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [styles.button, blocked ? styles.buttonDisabled : null, pressed ? styles.buttonPressed : null]}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color="#f7fff9" />
      ) : (
        <View style={styles.row}>
          <Text style={styles.title}>{title}</Text>
          <MaterialCommunityIcons name="arrow-right" size={23} color="#f7fff9" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 12,
    backgroundColor: '#22c95f',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16ad4c',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 9,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#f7fff9',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
