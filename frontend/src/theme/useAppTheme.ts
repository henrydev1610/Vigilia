import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/theme.store';
import { useThemePreference } from './AppThemeProvider';
import { resolveTheme } from './tokens';

export function useAppTheme() {
  const preference = useThemePreference();
  if (preference) {
    return preference.theme;
  }

  const mode = useThemeStore((state) => state.mode);
  const setResolvedThemeFromSystem = useThemeStore((state) => state.setResolvedThemeFromSystem);
  const systemScheme = useColorScheme();
  const systemMode = systemScheme === 'light' ? 'light' : 'dark';
  const resolvedMode = mode === 'system' ? systemMode : mode;

  useEffect(() => {
    setResolvedThemeFromSystem(systemMode);
  }, [setResolvedThemeFromSystem, systemMode]);

  return resolveTheme(resolvedMode);
}
