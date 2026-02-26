export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Inicio: undefined;
  Explorar: undefined;
  Ranking: undefined;
  Gastos: undefined;
  Alertas: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  DeputadoDetail: { deputyId: number; deputyName?: string };
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

