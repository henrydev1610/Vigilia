import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getMyProfileRequest, updateMyProfileRequest } from '../services/endpoints';

export const USER_PROFILE_STORAGE_KEY = 'user-profile-store-v2';

export interface StoredUserProfile {
  displayName: string;
  email: string;
  avatarUri: string | null;
  partiesInterest: string[];
  statesInterest: string[];
  monitoringCount: number;
  alertsEnabled: boolean;
  biometricEnabled: boolean;
}

interface UserProfileState extends StoredUserProfile {
  activeUserId: string | null;
  profilesByUserId: Record<string, StoredUserProfile>;
  bindToUser: (user: { id: string; name: string; email: string } | null) => void;
  loadRemoteProfile: () => Promise<void>;
  saveRemoteProfile: (payload: Partial<StoredUserProfile>) => Promise<void>;
  setDisplayName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setPartiesInterest: (list: string[]) => void;
  setStatesInterest: (list: string[]) => void;
  setMonitoringCount: (value: number) => void;
  setAlertsEnabled: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  clearActiveUser: () => void;
}

const EMPTY_PROFILE: StoredUserProfile = {
  displayName: '',
  email: '',
  avatarUri: null,
  partiesInterest: [],
  statesInterest: [],
  monitoringCount: 0,
  alertsEnabled: true,
  biometricEnabled: false,
};

const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const dedupeAndClean = (values: string[]) => Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));

function asRemotePayload(input: Partial<StoredUserProfile>) {
  const next: Record<string, unknown> = {};
  if ('avatarUri' in input) next.avatarUrl = input.avatarUri ?? null;
  if ('partiesInterest' in input) next.interestedParties = input.partiesInterest ?? [];
  if ('statesInterest' in input) next.interestedStates = input.statesInterest ?? [];
  if ('alertsEnabled' in input) next.alertsEnabled = input.alertsEnabled;
  if ('biometricEnabled' in input) next.biometricEnabled = input.biometricEnabled;
  if ('monitoringCount' in input) next.monitoringCount = input.monitoringCount;
  return next;
}

function sanitizeProfilePatch(input: Partial<StoredUserProfile>): Partial<StoredUserProfile> {
  const patch: Partial<StoredUserProfile> = {};

  if (typeof input.displayName === 'string') {
    const normalized = normalizeName(input.displayName);
    if (normalized.length >= 2) {
      patch.displayName = normalized;
    }
  }
  if (typeof input.email === 'string') {
    const normalized = normalizeEmail(input.email);
    if (normalized) {
      patch.email = normalized;
    }
  }
  if ('avatarUri' in input) {
    patch.avatarUri = input.avatarUri ?? null;
  }
  if (Array.isArray(input.partiesInterest)) {
    patch.partiesInterest = dedupeAndClean(input.partiesInterest).map((item) => item.toUpperCase());
  }
  if (Array.isArray(input.statesInterest)) {
    patch.statesInterest = dedupeAndClean(input.statesInterest).map((item) => item.toUpperCase());
  }
  if (typeof input.monitoringCount === 'number' && Number.isFinite(input.monitoringCount)) {
    patch.monitoringCount = Math.max(0, Math.trunc(input.monitoringCount));
  }
  if (typeof input.alertsEnabled === 'boolean') {
    patch.alertsEnabled = input.alertsEnabled;
  }
  if (typeof input.biometricEnabled === 'boolean') {
    patch.biometricEnabled = input.biometricEnabled;
  }

  return patch;
}

function mergeProfile(base: StoredUserProfile, patch: Partial<StoredUserProfile>) {
  return {
    ...base,
    ...patch,
  };
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      ...EMPTY_PROFILE,
      activeUserId: null,
      profilesByUserId: {},

      bindToUser: (user) => {
        if (!user?.id) {
          set({ ...EMPTY_PROFILE, activeUserId: null });
          return;
        }

        const normalizedName = normalizeName(user.name);
        const normalizedEmail = normalizeEmail(user.email);
        const existing = get().profilesByUserId[user.id] ?? EMPTY_PROFILE;
        const hydrated = mergeProfile(existing, {
          displayName: normalizedName || existing.displayName || EMPTY_PROFILE.displayName,
          email: normalizedEmail || existing.email || EMPTY_PROFILE.email,
        });

        set((state) => ({
          ...hydrated,
          activeUserId: user.id,
          profilesByUserId: {
            ...state.profilesByUserId,
            [user.id]: hydrated,
          },
        }));
      },

      loadRemoteProfile: async () => {
        const activeUserId = get().activeUserId;
        if (!activeUserId) return;

        const remote = await getMyProfileRequest();
        if (!remote || remote.userId !== activeUserId) return;

        const patch: Partial<StoredUserProfile> = {
          avatarUri: remote.avatarUrl ?? null,
          partiesInterest: remote.interestedParties,
          statesInterest: remote.interestedStates,
          alertsEnabled: remote.alertsEnabled,
          biometricEnabled: remote.biometricEnabled,
          monitoringCount: remote.monitoringCount,
        };

        const sanitized = sanitizeProfilePatch(patch);
        set((state) => {
          const base = state.profilesByUserId[activeUserId] ?? EMPTY_PROFILE;
          const next = mergeProfile(base, sanitized);
          return {
            ...next,
            profilesByUserId: {
              ...state.profilesByUserId,
              [activeUserId]: next,
            },
          };
        });
      },

      saveRemoteProfile: async (payload) => {
        const activeUserId = get().activeUserId;
        if (!activeUserId) return;

        const sanitized = sanitizeProfilePatch(payload);
        if (Object.keys(sanitized).length === 0) return;

        set((state) => {
          const base = state.profilesByUserId[activeUserId] ?? EMPTY_PROFILE;
          const next = mergeProfile(base, sanitized);
          return {
            ...next,
            profilesByUserId: {
              ...state.profilesByUserId,
              [activeUserId]: next,
            },
          };
        });

        const remotePayload = asRemotePayload(sanitized);
        if (Object.keys(remotePayload).length > 0) {
          await updateMyProfileRequest(remotePayload);
        }
      },

      setDisplayName: (name) => {
        const normalized = normalizeName(name);
        if (!normalized || normalized.length < 2) return;
        void get().saveRemoteProfile({ displayName: normalized });
      },

      setEmail: (email) => {
        const normalized = normalizeEmail(email);
        if (!normalized) return;
        set((prev) => (prev.email === normalized ? prev : { email: normalized }));
      },

      setAvatarUri: (uri) => {
        void get().saveRemoteProfile({ avatarUri: uri });
      },

      setPartiesInterest: (list) => {
        void get().saveRemoteProfile({ partiesInterest: list });
      },

      setStatesInterest: (list) => {
        void get().saveRemoteProfile({ statesInterest: list });
      },

      setMonitoringCount: (value) => {
        void get().saveRemoteProfile({ monitoringCount: value });
      },

      setAlertsEnabled: (enabled) => {
        void get().saveRemoteProfile({ alertsEnabled: enabled });
      },

      setBiometricEnabled: (enabled) => {
        void get().saveRemoteProfile({ biometricEnabled: enabled });
      },

      clearActiveUser: () => {
        set({ ...EMPTY_PROFILE, activeUserId: null });
      },
    }),
    {
      name: USER_PROFILE_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeUserId: state.activeUserId,
        profilesByUserId: state.profilesByUserId,
      }),
    },
  ),
);
