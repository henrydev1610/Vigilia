import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTabParamList } from './types';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DeputadosScreen } from '../screens/app/DeputadosScreen';
import { RankingScreen as AppRankingScreen } from '../screens/app/RankingScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { designSystem } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();
const TAB_HEIGHT = 64;

export const AppTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(6, insets.bottom);

  return (
    <Tab.Navigator
      initialRouteName="Explorar"
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarStyle: {
          backgroundColor: designSystem.colors.bg,
          borderTopWidth: 0,
          height: TAB_HEIGHT + bottomInset,
          paddingTop: 2,
          paddingBottom: bottomInset,
        },
        tabBarItemStyle: {
          height: TAB_HEIGHT,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: '600',
          includeFontPadding: false,
        },
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarActiveTintColor: designSystem.colors.green,
        tabBarInactiveTintColor: designSystem.colors.tabInactive,
        tabBarIcon: ({ color, size }) => {
          const map: Record<keyof AppTabParamList, React.ComponentProps<typeof Icon>['name']> = {
            Inicio: 'home',
            Explorar: 'compass',
            Ranking: 'chart-bar',
            Gastos: 'file-document-outline',
            Alertas: 'bell',
          };
          return <Icon name={map[route.name as keyof AppTabParamList]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Explorar" component={DeputadosScreen} />
      <Tab.Screen name="Ranking" component={AppRankingScreen} />
      <Tab.Screen name="Gastos" component={ExpensesScreen} />
      <Tab.Screen name="Alertas" component={AlertsScreen} />
    </Tab.Navigator>
  );
};
