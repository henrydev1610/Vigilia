import { create } from 'zustand';

export interface DeputadoListItem {
  id: number;
  nome: string;
  partido: string;
  uf: string;
  fotoUrl: string | null;
}

interface DeputadosState {
  deputados: DeputadoListItem[];
  hydrationReady: boolean;
  isLoadingList: boolean;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  syncing: boolean;
  progress: string | null;
  setHydrationReady: (value: boolean) => void;
  setIsLoadingList: (value: boolean) => void;
  setDeputados: (items: DeputadoListItem[]) => void;
  setLoading: (value: boolean) => void;
  setRefreshing: (value: boolean) => void;
  setLoadingMore: (value: boolean) => void;
  setSyncing: (value: boolean) => void;
  setProgress: (value: string | null) => void;
}

export const useDeputadosStore = create<DeputadosState>((set) => ({
  deputados: [],
  hydrationReady: false,
  isLoadingList: false,
  loading: false,
  refreshing: false,
  loadingMore: false,
  syncing: false,
  progress: null,
  setHydrationReady: (value) => set({ hydrationReady: value }),
  setIsLoadingList: (value) => set({ isLoadingList: value, loading: value }),
  setDeputados: (items) => set({ deputados: items }),
  setLoading: (value) => set({ loading: value, isLoadingList: value }),
  setRefreshing: (value) => set({ refreshing: value }),
  setLoadingMore: (value) => set({ loadingMore: value }),
  setSyncing: (value) => set({ syncing: value }),
  setProgress: (value) => set({ progress: value }),
}));
