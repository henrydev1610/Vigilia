import { useColorScheme } from 'react-native';
import { resolveTheme } from './tokens';

export function useAppTheme() {
  const scheme = useColorScheme();
  return resolveTheme(scheme);
}

