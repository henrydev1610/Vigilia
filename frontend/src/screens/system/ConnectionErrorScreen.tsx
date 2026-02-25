import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Screen } from '../../components/ui/Screen';
import {
  ApiRequestErrorDetails,
  ApiUrlSource,
  clearDevApiUrlOverride,
  getApiExampleUrl,
  saveDevApiUrlOverride,
} from '../../services/api';

interface ConnectionErrorScreenProps {
  baseUrl: string | null;
  envUrl: string | null;
  source: ApiUrlSource;
  message: string;
  requestError: ApiRequestErrorDetails | null;
  onRetry: () => void;
}

export const ConnectionErrorScreen: React.FC<ConnectionErrorScreenProps> = ({
  baseUrl,
  envUrl,
  source,
  message,
  requestError,
  onRetry,
}) => {
  const [manualUrl, setManualUrl] = useState(baseUrl ?? envUrl ?? '');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setManualUrl(baseUrl ?? envUrl ?? '');
  }, [baseUrl, envUrl]);

  const healthUrl = useMemo(() => {
    if (!baseUrl) {
      return null;
    }
    return `${baseUrl.replace(/\/$/, '')}/health`;
  }, [baseUrl]);

  async function handleCopyExample() {
    await Clipboard.setStringAsync(getApiExampleUrl());
    setFeedback(`Exemplo copiado: ${getApiExampleUrl()}`);
  }

  async function handleSaveDevOverride() {
    if (!__DEV__) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const saved = await saveDevApiUrlOverride(manualUrl);
      setFeedback(`Override DEV salvo: ${saved}`);
      onRetry();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel salvar override DEV.');
    } finally {
      setBusy(false);
    }
  }

  async function handleClearDevOverride() {
    if (!__DEV__) {
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await clearDevApiUrlOverride();
      setFeedback('Override DEV removido. Voltando para EXPO_PUBLIC_API_URL.');
      onRetry();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Nao foi possivel limpar override DEV.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sem conexao com a API</Text>
        <Text style={styles.subtitle}>{message}</Text>

        <Card>
          <Text style={styles.sectionTitle}>Diagnostico</Text>
          <Text style={styles.item}>Base detectada: {baseUrl ?? '(vazia)'}</Text>
          <Text style={styles.item}>EXPO_PUBLIC_API_URL: {envUrl ?? '(nao definido)'}</Text>
          <Text style={styles.item}>Fonte ativa: {source}</Text>
          {requestError ? (
            <Text style={styles.item}>
              Erro real: {requestError.kind}
              {requestError.status ? ` | status ${requestError.status}` : ''}
              {requestError.code ? ` | code ${requestError.code}` : ''}
              {' | '}
              {requestError.message}
            </Text>
          ) : null}
        </Card>

        {!envUrl ? (
          <Card>
            <Text style={styles.sectionTitle}>Como configurar</Text>
            <Text style={styles.item}>1. Crie/edite o arquivo .env na raiz do app.</Text>
            <Text style={styles.item}>2. Defina EXPO_PUBLIC_API_URL=http://192.168.18.24:3333</Text>
            <Text style={styles.item}>3. Reinicie com npx expo start -c --lan</Text>
            <Text style={styles.item}>4. No celular fisico, nao use localhost.</Text>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button title="Testar novamente" onPress={onRetry} style={styles.button} />
          <Button
            title="Copiar exemplo de URL"
            variant="secondary"
            onPress={handleCopyExample}
            style={styles.button}
          />
          <Button
            title="Abrir URL da API"
            variant="secondary"
            onPress={() => {
              if (!healthUrl) {
                return;
              }
              Linking.openURL(healthUrl).catch(() => undefined);
            }}
            disabled={!healthUrl}
            style={styles.button}
          />
        </View>

        {__DEV__ ? (
          <Card>
            <Text style={styles.sectionTitle}>Override manual (somente DEV)</Text>
            <Input
              value={manualUrl}
              onChangeText={setManualUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.18.24:3333"
            />
            <Button
              title="Salvar override DEV"
              onPress={handleSaveDevOverride}
              loading={busy}
              style={styles.button}
            />
            <Button
              title="Limpar override DEV"
              variant="secondary"
              onPress={handleClearDevOverride}
              disabled={busy}
            />
          </Card>
        ) : null}

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  title: {
    color: '#F2F7FD',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A4B5C7',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#EAF1F8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  item: {
    color: '#BFD0E2',
    marginBottom: 6,
  },
  actions: {
    marginTop: 12,
  },
  button: {
    marginBottom: 10,
  },
  feedback: {
    color: '#8BD5A8',
    marginTop: 8,
    marginBottom: 4,
  },
});
