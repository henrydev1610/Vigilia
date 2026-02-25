import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';

interface LoginFormProps {
  onSubmit?: () => void;
  onForgotPassword?: () => void;
  onRequestAccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onForgotPassword, onRequestAccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Acesso Institucional</Text>
      <Text style={styles.subtitle}>Entre com suas credenciais para continuar</Text>

      <Text style={styles.fieldLabel}>E-MAIL</Text>
      <View style={styles.inputBox}>
        <Icon name="email-outline" size={18} color={colors.loginLabel} />
        <TextInput style={styles.input} placeholder="usuario@orgao.gov.br" placeholderTextColor={colors.loginSubtitle} />
      </View>

      <Text style={styles.fieldLabel}>SENHA</Text>
      <View style={styles.inputBox}>
        <Icon name="lock-outline" size={18} color={colors.loginLabel} />
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor={colors.loginSubtitle}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPassword((prev) => !prev)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.loginLabel} />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setRemember((prev) => !prev)} style={styles.rememberRow}>
          <View style={[styles.checkbox, remember ? styles.checkboxOn : undefined]} />
          <Text style={styles.optionsText}>Lembrar acesso</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={onForgotPassword}>
          <Text style={styles.optionsText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={onSubmit} style={styles.submitButton}>
        <Text style={styles.submitText}>Entrar</Text>
        <Icon name="arrow-right" size={18} color={colors.white} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.8} onPress={onRequestAccess}>
        <Text style={styles.requestAccess}>Solicitar acesso institucional</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    marginHorizontal: spacing.base,
    padding: spacing.xl,
  },
  title: {
    color: colors.loginTitle,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.loginSubtitle,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.loginLabel,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  inputBox: {
    alignItems: 'center',
    backgroundColor: colors.loginInput,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
  },
  input: {
    color: colors.loginTitle,
    flex: 1,
    height: 44,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.base,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  checkbox: {
    backgroundColor: colors.white,
    borderColor: colors.borderInput,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  checkboxOn: {
    backgroundColor: colors.greenMid,
    borderColor: colors.greenMid,
  },
  optionsText: {
    color: colors.loginLabel,
    fontSize: typography.fontSize.sm,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.greenBright,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
  },
  submitText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  requestAccess: {
    color: colors.greenMid,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.base,
    textAlign: 'center',
  },
});
