import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../theme';
import { Button, Card, Input, Screen, Snackbar } from '../components/ui';
import { AppLogo } from '../components/branding/AppLogo';

interface LoginScreenProps {
  onLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleLogin() {
    if (!email || !password) {
      setError('Informe e-mail e senha para continuar.');
      return;
    }
    setError(null);
    onLogin?.();
  }

  return (
    <Screen>
      <View style={styles.wrapper}>
        <View style={styles.brand}>
          <AppLogo size={54} />
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Vigília</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Transparência pública em tempo real.</Text>
        </View>

        <Card>
          <Input label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="voce@email.com" />
          <Input label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="Sua senha" />
          {error ? <Snackbar message={error} tone="error" /> : null}
          <Button title="Entrar" onPress={handleLogin} style={styles.button} />
        </Card>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    marginTop: 8,
  },
  subtitle: {
    marginTop: 4,
  },
  button: {
    marginTop: 12,
  },
});
