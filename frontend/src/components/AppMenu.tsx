import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList, AppTabParamList } from '../navigation/types';
import { useAppTheme } from '../theme';
import { AppText } from './ui';

const TAB_ICON_BY_ROUTE: Record<keyof AppTabParamList, React.ComponentProps<typeof Icon>['name']> = {
  Inicio: 'home',
  Explorar: 'compass',
  Ranking: 'chart-bar',
  Gastos: 'file-document-outline',
  Alertas: 'bell',
};

const TAB_LABEL_BY_ROUTE: Record<keyof AppTabParamList, string> = {
  Inicio: 'Início',
  Explorar: 'Explorar',
  Ranking: 'Ranking',
  Gastos: 'Gastos',
  Alertas: 'Alertas',
};

const TAB_ROUTES: Array<keyof AppTabParamList> = ['Inicio', 'Explorar', 'Ranking', 'Gastos', 'Alertas'];

export const APP_MENU_BASE_HEIGHT = 64;
export const APP_MENU_MIN_BOTTOM_GAP = 6;

interface AppMenuProps {
  activeTab?: keyof AppTabParamList;
}

type StackNav = StackNavigationProp<AppStackParamList>;

export const AppMenu: React.FC<AppMenuProps> = ({ activeTab }) => {
  const navigation = useNavigation<StackNav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const bottomInset = Math.max(APP_MENU_MIN_BOTTOM_GAP, insets.bottom);

  const handleTabPress = useCallback(
    (routeName: keyof AppTabParamList) => {
      navigation.navigate('Tabs', { screen: routeName });
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, height: APP_MENU_BASE_HEIGHT + bottomInset, paddingBottom: bottomInset },
      ]}
    >
      {TAB_ROUTES.map((routeName) => {
        const active = routeName === activeTab;
        const color = active ? theme.colors.primary : theme.colors.tabIconInactive;
        return (
          <Pressable key={routeName} onPress={() => handleTabPress(routeName)} style={styles.item}>
            <Icon name={TAB_ICON_BY_ROUTE[routeName]} size={23} color={color} />
            <AppText style={[styles.label, { color }]}>{TAB_LABEL_BY_ROUTE[routeName]}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0,
    flexDirection: 'row',
    left: 0,
    paddingTop: 2,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: APP_MENU_BASE_HEIGHT,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 14,
    marginTop: 1,
  },
});
