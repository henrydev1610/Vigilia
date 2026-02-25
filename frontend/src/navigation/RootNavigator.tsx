import React, { useCallback, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { RootStackParamList } from './types';
import {
  ApiRequestErrorDetails,
  getApiRequestErrorDetails,
  getApiResolution,
  pingHealth,
  resolveApiBaseUrl,
} from '../services/api';
import { ConnectionErrorScreen } from '../screens/system/ConnectionErrorScreen';
import { useAuthStore } from '../store/authStore';
import { Screen } from '../components/ui/Screen';
import { LoadingState } from '../components/ui/LoadingState';

const RootStack = createStackNavigator<RootStackParamList>();

type HealthStatus = 'checking' | 'ok' | 'error';

export const RootNavigator: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken);

  const [healthStatus, setHealthStatus] = useState<HealthStatus>('checking');
  const [healthMessage, setHealthMessage] = useState('Conectando ao backend...');
  const [requestError, setRequestError] = useState<ApiRequestErrorDetails | null>(null);

  const checkHealth = useCallback(async () => {
    setHealthStatus('checking');
    setRequestError(null);

    const resolution = await resolveApiBaseUrl();

    if (!resolution.baseUrl) {
      setHealthMessage(resolution.message ?? 'EXPO_PUBLIC_API_URL nao definido.');
      setHealthStatus('error');
      return;
    }

    try {
      await pingHealth();
      setHealthStatus('ok');
    } catch (error) {
      const details = getApiRequestErrorDetails(error);
      const healthTarget = resolution.baseUrl ? `${resolution.baseUrl.replace(/\/$/, '')}/health` : '/health';
      setRequestError(details);
      if (details.kind === 'http' && details.status) {
        setHealthMessage(`Falha em ${healthTarget}: HTTP ${details.status} - ${details.message}`);
      } else {
        setHealthMessage(
          `Falha em ${healthTarget}: ${details.message}${details.code ? ` (code ${details.code})` : ''}`,
        );
      }
      setHealthStatus('error');
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  if (healthStatus === 'checking') {
    return (
      <Screen>
        <LoadingState label="Verificando conexao com a API..." />
      </Screen>
    );
  }

  if (healthStatus === 'error') {
    const resolution = getApiResolution();
    return (
      <ConnectionErrorScreen
        baseUrl={resolution.baseUrl}
        envUrl={resolution.envUrl}
        source={resolution.source}
        message={healthMessage}
        requestError={requestError}
        onRetry={checkHealth}
      />
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="App" component={AppNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};
