import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { AuthCard, AuthLayout, IconTextInput, PrimaryButton } from '../../components/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type LoginNav = StackNavigationProp<AuthStackParamList, 'Login'>;

const REMEMBER_ACCESS_KEY = 'auth:rememberAccessEmail';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberAccess, setRememberAccess] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    let active = true;
    (async () => {
      const savedEmail = await AsyncStorage.getItem(REMEMBER_ACCESS_KEY);
      if (!active || !savedEmail) return;
      setEmail(savedEmail);
      setRememberAccess(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email.trim()) return 'Informe o e-mail institucional.';
    if (!isValidEmail(email)) return 'E-mail inválido.';
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password.trim()) return 'Informe sua senha.';
    if (password.trim().length < 6) return 'Senha deve ter ao menos 6 caracteres.';
    return null;
  }, [password, touched.password]);

  const isFormValid = Boolean(email.trim() && isValidEmail(email) && password.trim().length >= 6);

  async function handleLogin() {
    setTouched({ email: true, password: true });
    if (!isFormValid) return;

    try {
      setError(null);
      await login(email, password);
      if (rememberAccess) {
        await AsyncStorage.setItem(REMEMBER_ACCESS_KEY, email.trim().toLowerCase());
      } else {
        await AsyncStorage.removeItem(REMEMBER_ACCESS_KEY);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível entrar.'));
    }
  }

  function handleForgotPassword() {
    Alert.alert(
      'Esqueci minha senha',
      'Recuperação de acesso institucional disponível na próxima versão.',
    );
  }

  return (
    <AuthLayout title="Vigília" subtitle="TRANSPARÊNCIA PÚBLICA"> 
      <AuthCard title="Tela de Login" subtitle="Insira suas credênciais abaixo para acompanhar os gastos do seu deputado de estimação. ">
        <IconTextInput
          label="E-MAIL "
          leftIcon="email-outline"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="email@email.com"
          error={emailError}
          returnKeyType="next"
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
          returnKeyType="done"
        />

        <View style={styles.rowBetween}>
          <Pressable
            style={styles.rememberWrap}
            onPress={() => setRememberAccess((prev) => !prev)}
            hitSlop={8}
          >
            <View style={[styles.checkbox, rememberAccess ? styles.checkboxChecked : null]}>
              {rememberAccess ? (
                <MaterialCommunityIcons name="check" size={14} color="#1db65a" />
              ) : null}
            </View>
            <Text style={styles.rememberText}>Lembrar acesso</Text>
          </Pressable>

          <Pressable onPress={handleForgotPassword} hitSlop={8}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <PrimaryButton
          title="Entrar"
          loading={isLoading}
          disabled={!isFormValid || isLoading}
          onPress={handleLogin}
        />

        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>Não possui conta? </Text>
          <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
            <Text style={styles.bottomLink}>Criar Conta </Text>
          </Pressable>
        </View>
      </AuthCard>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  rowBetween: {
    marginTop: 6,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#c6d0dc',
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#21c75f',
  },
  rememberText: {
    marginLeft: 8,
    color: '#6f7d8d',
    fontSize: 15,
    fontWeight: '700',
  },
  forgotText: {
    color: '#44686f',
    fontSize: 15,
    paddingLeft:10,
    fontWeight: '800',
  },
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
