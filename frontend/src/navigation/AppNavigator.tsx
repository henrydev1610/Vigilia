import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AppTabs } from './AppTabs';
import { DeputadoDetailScreen } from '../screens/app/DeputadoDetailScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { AppStackParamList } from './types';
import { useAppTheme } from '../theme';

const Stack = createStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="DeputadoDetail" component={DeputadoDetailScreen} options={{ title: 'Detalhes do Deputado' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
