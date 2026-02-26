import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { AppTheme, AppThemeMode, resolveTheme } from './tokens';

export type ThemePreferenceMode = 'system' | AppThemeMode;

interface ThemePreferenceContextValue {
  mode: ThemePreferenceMode;
  resolvedMode: AppThemeMode;
  theme: AppTheme;
  isReady: boolean;
  setMode: (mode: ThemePreferenceMode) => Promise<void>;
}

const STORAGE_KEY = 'ui:theme-mode';
const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export const AppThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemePreferenceMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) {
          return;
        }
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState((prev) => (prev === stored ? prev : stored));
        }
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const resolvedMode: AppThemeMode = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
  const theme = useMemo(() => resolveTheme(resolvedMode), [resolvedMode]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void AsyncStorage.setItem(STORAGE_KEY, mode);
  }, [isReady, mode]);

  const setMode = async (nextMode: ThemePreferenceMode) => {
    setModeState((prev) => (prev === nextMode ? prev : nextMode));
  };

  const value = useMemo<ThemePreferenceContextValue>(() => ({
    mode,
    resolvedMode,
    theme,
    isReady,
    setMode,
  }), [isReady, mode, resolvedMode, theme]);

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
};

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    return null;
  }
  return context;
}
