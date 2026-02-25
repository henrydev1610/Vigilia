import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTabParamList } from './types';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DeputadosScreen } from '../screens/app/DeputadosScreen';
import { RankingScreen } from '../screens/app/RankingScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const TAB_BAR_CONTENT_HEIGHT = 58;
const TAB_BAR_BOTTOM_GAP = 8;
const TAB_BAR_ITEM_TOP_PADDING = 6;
const TAB_BAR_ITEM_BOTTOM_PADDING = 4;

export const AppTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, TAB_BAR_BOTTOM_GAP);

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        freezeOnBlur: true,
        tabBarStyle: {
          backgroundColor: '#07110E',
          borderTopWidth: 0,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: 0,
          paddingBottom: bottomInset,
        },
        tabBarItemStyle: {
          height: TAB_BAR_CONTENT_HEIGHT,
          paddingTop: TAB_BAR_ITEM_TOP_PADDING,
          paddingBottom: TAB_BAR_ITEM_BOTTOM_PADDING,
        },
        tabBarIconStyle: {
          marginTop: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 13,
          fontWeight: '600',
          marginBottom: 0,
          paddingBottom: 0,
          includeFontPadding: false,
        },
        tabBarActiveTintColor: '#22D663',
        tabBarInactiveTintColor: '#8FA2B8',
        tabBarIcon: ({ color, size }) => {
          const map: Record<keyof AppTabParamList, React.ComponentProps<typeof Icon>['name']> = {
            Inicio: 'view-grid',
            Buscar: 'magnify',
            Analises: 'chart-line',
            Ajustes: 'cog',
          };
          return <Icon name={map[route.name as keyof AppTabParamList]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Buscar" component={DeputadosScreen} />
      <Tab.Screen name="Analises" component={RankingScreen} options={{ tabBarLabel: 'Análises' }} />
      <Tab.Screen name="Ajustes" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

