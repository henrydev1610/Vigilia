import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppThemeMode } from '../theme/tokens';

export type ThemeMode = 'system' | AppThemeMode;
export const THEME_STORAGE_KEY = 'theme-store-v1';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: AppThemeMode;
  setMode: (mode: ThemeMode) => void;
  setResolvedThemeFromSystem: (systemMode: AppThemeMode) => void;
  hydrateTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      resolvedTheme: 'dark',
      setMode: (mode) => set((prev) => (prev.mode === mode ? prev : { mode })),
      setResolvedThemeFromSystem: (systemMode) =>
        set((prev) => {
          const nextResolved = prev.mode === 'system' ? systemMode : prev.mode;
          return prev.resolvedTheme === nextResolved ? prev : { resolvedTheme: nextResolved };
        }),
      hydrateTheme: async () => {
        await useThemeStore.persist.rehydrate();
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        const nextResolved = state.mode === 'system' ? state.resolvedTheme : state.mode;
        state.setResolvedThemeFromSystem(nextResolved);
      },
    },
  ),
);
