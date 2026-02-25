import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../utils/apiError';
import { fallbackFonts, useAppTheme } from '../../theme';
import { Button, Card, Input, LoadingState, Screen, Snackbar } from '../../components/ui';

export const ProfileScreen: React.FC = () => {
  const theme = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const updateMe = useAuthStore((state) => state.updateMe);
  const changePassword = useAuthStore((state) => state.changePassword);
  const deleteMe = useAuthStore((state) => state.deleteMe);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const me = await fetchMe();
        if (active && me) {
          setName(me.name);
          setEmail(me.email);
        }
        if (active) {
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [fetchMe]),
  );

  async function handleUpdateProfile() {
    try {
      setError(null);
      await updateMe({ name: name.trim(), email: email.trim().toLowerCase() });
      Alert.alert('Perfil atualizado', 'Seus dados foram atualizados com sucesso.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar perfil.'));
    }
  }

  async function handleChangePassword() {
    try {
      setError(null);
      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Senha alterada', 'Sua senha foi alterada com sucesso.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível alterar a senha.'));
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      setError('Informe a senha para excluir a conta.');
      return;
    }

    Alert.alert('Excluir conta', 'Esta ação é permanente. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setError(null);
            await deleteMe(deletePassword.trim());
          } catch (err) {
            setError(getApiErrorMessage(err, 'Não foi possível excluir a conta.'));
          }
        },
      },
    ]);
  }

  return (
    <Screen includeBottomInset={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontFamily: fallbackFonts.headingBold,
              fontSize: theme.typography.size.h2,
              lineHeight: theme.typography.lineHeight.h2,
            },
          ]}
        >
          Perfil
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: fallbackFonts.body,
              fontSize: theme.typography.size.body,
              lineHeight: theme.typography.lineHeight.body,
            },
          ]}
        >
          Gestão da conta e segurança da sessão.
        </Text>

        {loading ? <LoadingState label="Carregando perfil..." /> : null}
        {error ? <Snackbar message={error} tone="error" /> : null}

        <Card style={styles.block}>
          <Text style={[styles.blockTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Dados da conta</Text>
          <Input label="Nome" value={name} onChangeText={setName} placeholder="Nome" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="email@dominio.com"
          />
          <Button title="Salvar perfil" onPress={handleUpdateProfile} />
        </Card>

        <Card style={styles.block}>
          <Text style={[styles.blockTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Alterar senha</Text>
          <Input
            label="Senha atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Senha atual"
          />
          <Input
            label="Nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Nova senha"
          />
          <Button title="Atualizar senha" onPress={handleChangePassword} variant="secondary" />
        </Card>

        <Card style={styles.block}>
          <Text style={[styles.blockTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Sessão</Text>
          <Text style={[styles.sessionText, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Usuário: {user?.email ?? '--'}</Text>
          <Button title="Sair" onPress={logout} variant="ghost" style={styles.inlineButton} />
        </Card>

        <Card style={styles.block}>
          <Text style={[styles.blockTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Excluir conta</Text>
          <Input
            label="Confirme sua senha"
            value={deletePassword}
            onChangeText={setDeletePassword}
            secureTextEntry
            placeholder="Senha"
          />
          <Button title="Excluir conta" onPress={handleDeleteAccount} variant="danger" />
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
    paddingTop: 8,
  },
  title: {},
  subtitle: {
    marginBottom: 12,
    marginTop: 4,
  },
  block: {
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  inlineButton: {
    marginTop: 10,
  },
  sessionText: {},
});


