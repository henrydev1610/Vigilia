export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Inicio: undefined;
  Buscar: undefined;
  Analises: undefined;
  Ajustes: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  DeputadoDetail: { deputyId: number; deputyName?: string };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

