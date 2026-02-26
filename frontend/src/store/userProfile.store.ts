import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const USER_PROFILE_STORAGE_KEY = 'user-profile-store-v1';

interface UserProfileState {
  displayName: string;
  email: string;
  avatarUri: string | null;
  partiesInterest: string[];
  statesInterest: string[];
  monitoringCount: number;
  alertsEnabled: boolean;
  biometricEnabled: boolean;
  setDisplayName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setPartiesInterest: (list: string[]) => void;
  setStatesInterest: (list: string[]) => void;
  setMonitoringCount: (value: number) => void;
  setAlertsEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  hydrateFromStorage: () => Promise<void>;
  persistToStorage: () => Promise<void>;
}

const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');
const normalizeEmail = (value: string) => value.trim().toLowerCase();

const dedupeAndClean = (values: string[]) => {
  const cleaned = values
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned));
};

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      displayName: 'João Silva',
      email: 'joao@email.com',
      avatarUri: null,
      partiesInterest: ['PT', 'PL', 'PSDB'],
      statesInterest: ['SP', 'DF'],
      monitoringCount: 14,
      alertsEnabled: true,
      biometricEnabled: false,

      setDisplayName: (name) => {
        const normalized = normalizeName(name);
        if (!normalized || normalized.length < 2) {
          return;
        }
        set((prev) => (prev.displayName === normalized ? prev : { displayName: normalized }));
      },

      setEmail: (email) => {
        const normalized = normalizeEmail(email);
        if (!normalized) {
          return;
        }
        set((prev) => (prev.email === normalized ? prev : { email: normalized }));
      },

      setAvatarUri: (uri) => {
        set((prev) => (prev.avatarUri === uri ? prev : { avatarUri: uri }));
      },

      setPartiesInterest: (list) => {
        const normalized = dedupeAndClean(list).map((item) => item.toUpperCase());
        set((prev) => (
          prev.partiesInterest.join('|') === normalized.join('|')
            ? prev
            : { partiesInterest: normalized }
        ));
      },

      setStatesInterest: (list) => {
        const normalized = dedupeAndClean(list).map((item) => item.toUpperCase());
        set((prev) => (
          prev.statesInterest.join('|') === normalized.join('|')
            ? prev
            : { statesInterest: normalized }
        ));
      },

      setMonitoringCount: (value) => {
        const next = Math.max(0, Math.trunc(value));
        set((prev) => (prev.monitoringCount === next ? prev : { monitoringCount: next }));
      },

      setAlertsEnabled: (enabled) => {
        set((prev) => (prev.alertsEnabled === enabled ? prev : { alertsEnabled: enabled }));
      },

      setBiometricEnabled: (enabled) => {
        set((prev) => (prev.biometricEnabled === enabled ? prev : { biometricEnabled: enabled }));
      },

      hydrateFromStorage: async () => {
        await useUserProfileStore.persist.rehydrate();
      },

      persistToStorage: async () => {
        const state = get();
        const persistedState = {
          state: {
            displayName: state.displayName,
            email: state.email,
            avatarUri: state.avatarUri,
            partiesInterest: state.partiesInterest,
            statesInterest: state.statesInterest,
            monitoringCount: state.monitoringCount,
            alertsEnabled: state.alertsEnabled,
            biometricEnabled: state.biometricEnabled,
          },
          version: 1,
        };
        await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(persistedState));
      },
    }),
    {
      name: USER_PROFILE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        displayName: state.displayName,
        email: state.email,
        avatarUri: state.avatarUri,
        partiesInterest: state.partiesInterest,
        statesInterest: state.statesInterest,
        monitoringCount: state.monitoringCount,
        alertsEnabled: state.alertsEnabled,
        biometricEnabled: state.biometricEnabled,
      }),
    },
  ),
);
