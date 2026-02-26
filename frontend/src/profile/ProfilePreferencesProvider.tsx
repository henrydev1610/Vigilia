import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'profile:preferences:v1';

interface ProfilePreferences {
  avatarUri: string | null;
  interestedParties: string[];
  interestedStates: string[];
  alertsEnabled: boolean;
  biometricEnabled: boolean;
  monitoredCount: number;
}

interface ProfilePreferencesContextValue {
  data: ProfilePreferences;
  isReady: boolean;
  setAvatarUri: (uri: string | null) => Promise<void>;
  setInterestedParties: (values: string[]) => Promise<void>;
  setInterestedStates: (values: string[]) => Promise<void>;
  setAlertsEnabled: (enabled: boolean) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
}

const defaultPreferences: ProfilePreferences = {
  avatarUri: null,
  interestedParties: ['PT', 'PL', 'PSDB', '+2 mais'],
  interestedStates: ['São Paulo (SP)', 'Brasília (DF)'],
  alertsEnabled: true,
  biometricEnabled: false,
  monitoredCount: 14,
};

const ProfilePreferencesContext = createContext<ProfilePreferencesContextValue | null>(null);

export const ProfilePreferencesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<ProfilePreferences>(defaultPreferences);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active || !raw) {
          return;
        }
        const parsed = JSON.parse(raw) as Partial<ProfilePreferences>;
        setData((prev) => ({
          ...prev,
          ...parsed,
          interestedParties: Array.isArray(parsed.interestedParties) ? parsed.interestedParties : prev.interestedParties,
          interestedStates: Array.isArray(parsed.interestedStates) ? parsed.interestedStates : prev.interestedStates,
        }));
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

  useEffect(() => {
    if (!isReady) {
      return;
    }
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, isReady]);

  const setAvatarUri = async (uri: string | null) => {
    setData((prev) => (prev.avatarUri === uri ? prev : { ...prev, avatarUri: uri }));
  };

  const setInterestedParties = async (values: string[]) => {
    setData((prev) => {
      if (prev.interestedParties.join('|') === values.join('|')) {
        return prev;
      }
      return { ...prev, interestedParties: values };
    });
  };

  const setInterestedStates = async (values: string[]) => {
    setData((prev) => {
      if (prev.interestedStates.join('|') === values.join('|')) {
        return prev;
      }
      return { ...prev, interestedStates: values };
    });
  };

  const setAlertsEnabled = async (enabled: boolean) => {
    setData((prev) => (prev.alertsEnabled === enabled ? prev : { ...prev, alertsEnabled: enabled }));
  };

  const setBiometricEnabled = async (enabled: boolean) => {
    setData((prev) => (prev.biometricEnabled === enabled ? prev : { ...prev, biometricEnabled: enabled }));
  };

  const value = useMemo<ProfilePreferencesContextValue>(() => ({
    data,
    isReady,
    setAvatarUri,
    setInterestedParties,
    setInterestedStates,
    setAlertsEnabled,
    setBiometricEnabled,
  }), [data, isReady]);

  return <ProfilePreferencesContext.Provider value={value}>{children}</ProfilePreferencesContext.Provider>;
};

export function useProfilePreferences() {
  const context = useContext(ProfilePreferencesContext);
  if (!context) {
    throw new Error('useProfilePreferences must be used inside ProfilePreferencesProvider');
  }
  return context;
}
