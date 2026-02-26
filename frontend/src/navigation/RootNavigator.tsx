import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { SplashScreen } from '../screens/system/SplashScreen';
import { useAuthStore } from '../store/authStore';
import { Screen } from '../components/ui/Screen';
import { LoadingState } from '../components/ui/LoadingState';
import { hideNativeSplash } from '../utils/nativeSplash';

const RootStack = createStackNavigator<RootStackParamList>();

type BootStatus = 'booting' | 'ready' | 'error';

export const RootNavigator: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isAuthenticated = Boolean(accessToken);

  const [bootStatus, setBootStatus] = useState<BootStatus>('booting');
  const [splashDone, setSplashDone] = useState(false);
  const [healthMessage, setHealthMessage] = useState('Conectando ao backend...');
  const [requestError, setRequestError] = useState<ApiRequestErrorDetails | null>(null);

  const nativeSplashHiddenRef = useRef(false);

  const hideNative = useCallback(() => {
    if (nativeSplashHiddenRef.current) {
      return;
    }
    nativeSplashHiddenRef.current = true;
    void hideNativeSplash().catch(() => {
      // Ignore hide race conditions.
    });
  }, []);

  const runBoot = useCallback(async () => {
    setBootStatus('booting');
    setRequestError(null);

    const resolution = await resolveApiBaseUrl();

    if (!resolution.baseUrl) {
      setHealthMessage(resolution.message ?? 'EXPO_PUBLIC_API_URL nao definido.');
      setBootStatus('error');
      return;
    }

    try {
      await pingHealth();
      await restoreSession();
      setBootStatus('ready');
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
      setBootStatus('error');
    }
  }, [restoreSession]);

  useEffect(() => {
    void runBoot();
  }, [runBoot]);

  if (!splashDone) {
    return (
      <SplashScreen
        readyToExit={bootStatus !== 'booting'}
        onFinish={() => setSplashDone(true)}
        onFirstFrame={hideNative}
      />
    );
  }

  if (bootStatus === 'booting') {
    return (
      <Screen>
        <LoadingState label="Verificando conexao com a API..." />
      </Screen>
    );
  }

  if (bootStatus === 'error') {
    const resolution = getApiResolution();
    return (
      <ConnectionErrorScreen
        baseUrl={resolution.baseUrl}
        envUrl={resolution.envUrl}
        source={resolution.source}
        message={healthMessage}
        requestError={requestError}
        onRetry={runBoot}
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
