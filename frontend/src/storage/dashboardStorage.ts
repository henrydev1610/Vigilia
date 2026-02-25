import AsyncStorage from '@react-native-async-storage/async-storage';
import { dashboardSeed } from '../data/dashboardSeed';
import { DashboardData } from '../types/dashboard';

const DASHBOARD_STORAGE_KEY = '@vigilia/dashboard/v1';

export async function getDashboardData(): Promise<DashboardData> {
  const stored = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
  if (!stored) {
    await seedDashboardData();
    return dashboardSeed;
  }

  try {
    const parsed = JSON.parse(stored) as DashboardData;
    return parsed;
  } catch {
    await seedDashboardData();
    return dashboardSeed;
  }
}

export async function setDashboardData(data: DashboardData): Promise<void> {
  await AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data));
}

export async function seedDashboardData(): Promise<void> {
  await setDashboardData(dashboardSeed);
}
