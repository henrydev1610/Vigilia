import React, { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/theme.store';
import { AppTheme, AppThemeMode, resolveTheme } from './tokens';

export type ThemePreferenceMode = 'system' | AppThemeMode;

interface ThemePreferenceContextValue {
  mode: ThemePreferenceMode;
  resolvedMode: AppThemeMode;
  theme: AppTheme;
  setMode: (mode: ThemePreferenceMode) => void;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export const AppThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const resolvedMode: AppThemeMode = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
  const theme = useMemo(() => resolveTheme(resolvedMode), [resolvedMode]);

  const value = useMemo<ThemePreferenceContextValue>(() => ({
    mode,
    resolvedMode,
    theme,
    setMode,
  }), [mode, resolvedMode, setMode, theme]);

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
};

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  return context;
}
