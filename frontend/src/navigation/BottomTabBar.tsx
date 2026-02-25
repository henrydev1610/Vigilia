import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { RankingScreen } from '../screens/RankingScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator();

const SearchScreen: React.FC = ExploreScreen;
const FavoritesScreen: React.FC = AlertsScreen;

const icons: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  Inicio: 'home',
  Explorar: 'compass',
  Ranking: 'podium',
  Gastos: 'chart-bar',
  Alertas: 'bell',
  Favoritos: 'star',
  Perfil: 'account',
  Buscar: 'magnify',
};

export const BottomTabBar: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.greenBright,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          marginBottom:50,
          backgroundColor: colors.bgCard,
          borderTopColor: colors.borderCard,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
        tabBarIcon: ({ color, size }) => (
          <Icon name={icons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Explorar" component={ExploreScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Gastos" component={ExpensesScreen} />
      <Tab.Screen name="Alertas" component={AlertsScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
    </Tab.Navigator>
  );
};
