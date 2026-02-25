import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StrengthLevel = {
  score: number;
  label: 'Fraca' | 'Média' | 'Forte' | 'Muito forte';
  color: string;
};

function getStrength(password: string): StrengthLevel {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLength, hasUpper && hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { score: 1, label: 'Fraca', color: '#df5f5f' };
  if (score === 2) return { score: 2, label: 'Média', color: '#ee9a3e' };
  if (score === 3) return { score: 3, label: 'Forte', color: '#39b96b' };
  return { score: 4, label: 'Muito forte', color: '#1a9f54' };
}

type PasswordStrengthBarProps = {
  password: string;
};

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>Força da senha</Text>
        <Text style={[styles.value, { color: strength.color }]}>{strength.label}</Text>
      </View>
      <View style={styles.barRow}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.segment,
              level <= strength.score ? { backgroundColor: strength.color } : null,
            ]}
          />
        ))}
      </View>
      <Text style={styles.hint}>Use 8+ caracteres, letras maiúsculas e minúsculas, número e símbolo.</Text>
    </View>
  );
}

export function passwordPassesPolicy(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

const styles = StyleSheet.create({
  wrap: {
    rowGap: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#5c697a',
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
  },
  barRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#dde4eb',
  },
  hint: {
    color: '#7f8b99',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
