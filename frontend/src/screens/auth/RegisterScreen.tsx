import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  AuthCard,
  AuthLayout,
  IconTextInput,
  PasswordStrengthBar,
  PrimaryButton,
  passwordPassesPolicy,
} from '../../components/auth';

type RegisterNav = StackNavigationProp<AuthStackParamList, 'Register'>;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNav>();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email.trim()) return 'Informe o e-mail institucional.';
    if (!isValidEmail(email)) return 'E-mail inválido.';
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password.trim()) return 'Informe a senha.';
    if (!passwordPassesPolicy(password)) return 'Senha não atende aos requisitos mínimos.';
    return null;
  }, [password, touched.password]);

  const confirmError = useMemo(() => {
    if (!touched.confirmPassword) return null;
    if (!confirmPassword.trim()) return 'Confirme sua senha.';
    if (confirmPassword !== password) return 'As senhas não coincidem.';
    return null;
  }, [confirmPassword, password, touched.confirmPassword]);

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      isValidEmail(email) &&
      passwordPassesPolicy(password) &&
      confirmPassword.length > 0 &&
      confirmPassword === password
    );
  }, [confirmPassword, email, password]);

  async function handleSubmit() {
    setTouched({ email: true, password: true, confirmPassword: true });
    if (!canSubmit) return;

    try {
      setError(null);
      await register('Acesso Institucional', email, password);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível solicitar acesso.'));
    }
  }

  return (
    <AuthLayout title="Vigília" subtitle="TRANSPARÊNCIA PÚBLICA">
      <AuthCard title="Tela de cadastro " subtitle="Insira um e-mail e uma senha forte, que você se lembre, para se cadastrar no app.">
        <IconTextInput
          label="E-MAIL"
          leftIcon="email-outline"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="email@email.com"
          error={emailError}
        />

        <IconTextInput
          label="SENHA"
          leftIcon="lock-outline"
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowPassword((prev) => !prev)}
          value={password}
          onChangeText={setPassword}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          error={passwordError}
        />

        <PasswordStrengthBar password={password} />

        <IconTextInput
          label="CONFIRMAR SENHA"
          leftIcon="lock-check-outline"
          rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
          placeholder="••••••••"
          secureTextEntry={!showConfirmPassword}
          error={confirmError}
        />

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <PrimaryButton
          title="Cadastrar"
          loading={isLoading}
          disabled={!canSubmit || isLoading}
          onPress={handleSubmit}
        />

        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>Já possui conta? </Text>
          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
            <Text style={styles.bottomLink}>Tela de login</Text>
          </Pressable>
        </View>
      </AuthCard>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  formError: {
    marginTop: 0,
    color: '#b64646',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  bottomInfo: {
    marginTop: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  bottomInfoText: {
    color: '#8693a2',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  bottomLink: {
    color: '#22be5c',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
});
