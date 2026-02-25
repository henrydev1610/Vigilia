import { create } from 'zustand';
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
  register: (name: string, email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<User | null>;
  updateMe: (payload: UpdateMePayload) => Promise<User | null>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  deleteMe: (password: string) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

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
      const tokens = await loginRequest({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      await get().fetchMe();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha no login.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    set({ isLoading: true, error: null });
    try {
      await registerRequest({
        name: name.trim(),
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
      return user;
    } catch {
      return null;
    }
  },

  updateMe: async (payload) => {
    const user = await updateMeRequest(payload);
    set({ user });
    return user;
  },

  changePassword: async (payload) => {
    await changePasswordRequest(payload);
  },

  deleteMe: async (password) => {
    await deleteMeRequest({ password });
    set({ user: null, accessToken: null, refreshToken: null });
  },

  refreshSession: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) {
      return null;
    }
    try {
      const tokens = await refreshRequest({ refreshToken });
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      return tokens.accessToken;
    } catch {
      set({ user: null, accessToken: null, refreshToken: null });
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
  },
});

