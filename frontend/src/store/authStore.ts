import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureApiAuth } from '../services/api';
import {
  authMeRequest,
  changePasswordRequest,
  deleteMeRequest,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
  updateMeRequest,
  userMeRequest,
} from '../services/endpoints';
import { ChangePasswordPayload, UpdateMePayload, User } from '../types/api';
import { useUserProfileStore } from './userProfile.store';
import { queryClient } from '../query/client';

const AUTH_ACCESS_TOKEN_KEY = 'auth:accessToken';
const AUTH_REFRESH_TOKEN_KEY = 'auth:refreshToken';

async function persistTokens(accessToken: string | null, refreshToken: string | null) {
  const tasks: Promise<unknown>[] = [];

  if (accessToken) {
    tasks.push(AsyncStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken));
  } else {
    tasks.push(AsyncStorage.removeItem(AUTH_ACCESS_TOKEN_KEY));
  }

  if (refreshToken) {
    tasks.push(AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken));
  } else {
    tasks.push(AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_KEY));
  }

  await Promise.all(tasks);
}

async function clearUserSessionState() {
  useUserProfileStore.getState().clearActiveUser();
  queryClient.clear();
  await persistTokens(null, null);
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  isAuthenticated: () => boolean;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<User | null>;
  updateMe: (payload: UpdateMePayload) => Promise<User | null>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  deleteMe: (password: string) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    void persistTokens(accessToken, refreshToken);
  },

  isAuthenticated: () => Boolean(get().accessToken),

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (__DEV__) {
      // Never log raw password. This keeps payload debugging safe.
      // eslint-disable-next-line no-console
      console.log('[auth] login payload', {
        email: normalizedEmail,
        passwordLength: normalizedPassword.length,
      });
    }

    set({ isLoading: true, error: null });
    try {
      useUserProfileStore.getState().clearActiveUser();
      const tokens = await loginRequest({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      await persistTokens(tokens.accessToken, tokens.refreshToken);
      await get().fetchMe();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha no login.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (firstName, lastName, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    set({ isLoading: true, error: null });
    try {
      await registerRequest({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        password: normalizedPassword,
      });
      await get().login(normalizedEmail, normalizedPassword);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha no cadastro.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    try {
      const user = await authMeRequest().catch(async () => userMeRequest());
      set({ user });
      useUserProfileStore.getState().bindToUser(user);
      await useUserProfileStore.getState().loadRemoteProfile();
      return user;
    } catch {
      return null;
    }
  },

  updateMe: async (payload) => {
    const user = await updateMeRequest(payload);
    set({ user });
    useUserProfileStore.getState().bindToUser(user);
    return user;
  },

  changePassword: async (payload) => {
    await changePasswordRequest(payload);
  },

  deleteMe: async (password) => {
    await deleteMeRequest({ password });
    set({ user: null, accessToken: null, refreshToken: null });
    await clearUserSessionState();
  },

  restoreSession: async () => {
    const [storedAccessToken, storedRefreshToken] = await Promise.all([
      AsyncStorage.getItem(AUTH_ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY),
    ]);

    const accessToken = storedAccessToken ?? null;
    const refreshToken = storedRefreshToken ?? null;

    if (!accessToken && !refreshToken) {
      set({ user: null, accessToken: null, refreshToken: null });
      useUserProfileStore.getState().clearActiveUser();
      return false;
    }

    set({ accessToken, refreshToken });

    if (!refreshToken) {
      set({ user: null, accessToken: null, refreshToken: null });
      await clearUserSessionState();
      return false;
    }

    if (!accessToken) {
      const renewed = await get().refreshSession();
      if (!renewed) {
        return false;
      }
    }

    const user = await get().fetchMe();
    if (user) {
      return true;
    }

    const renewed = await get().refreshSession();
    if (!renewed) {
      return false;
    }

    const refreshedUser = await get().fetchMe();
    if (!refreshedUser) {
      set({ user: null, accessToken: null, refreshToken: null });
      await clearUserSessionState();
      return false;
    }

    return true;
  },

  refreshSession: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      return null;
    }
    try {
      const tokens = await refreshRequest({ refreshToken });
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      await persistTokens(tokens.accessToken, tokens.refreshToken);
      return tokens.accessToken;
    } catch {
      set({ user: null, accessToken: null, refreshToken: null });
      await clearUserSessionState();
      return null;
    }
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch {
      // Ignore network errors during logout to keep UX responsive.
    }
    set({ user: null, accessToken: null, refreshToken: null });
    await clearUserSessionState();
  },
}));

configureApiAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  refreshTokens: async (refreshToken) => {
    const tokens = await refreshRequest({ refreshToken });
    useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  },
  handleAuthFailure: () => {
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
    void clearUserSessionState();
  },
});
