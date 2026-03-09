import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Inicio: undefined;
  Explorar: undefined;
  Ranking: undefined;
  Gastos: { ano?: number; mes?: number } | undefined;
  Alertas: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabParamList> | undefined;
  DeputadoDetail: { deputyId: number; deputyName?: string; ano?: number; mes?: number };
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
