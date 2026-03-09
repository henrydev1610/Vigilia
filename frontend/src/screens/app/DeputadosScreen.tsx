import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import { useDeputadosScreen } from '../../hooks';
import { toAbsoluteUrl } from '../../services/api';
import { useAppTheme } from '../../theme';
import { DeputyCard, DropdownFilter, DropdownOption, FilterChip, SearchInput } from '../../components/deputados';
import { HeaderProfileButton } from '../../components/header';
import { AppText, EmptyState, ErrorBanner, LoadingState, ScreenBackground, Snackbar } from '../../components/ui';

type Nav = StackNavigationProp<AppStackParamList, 'Tabs'>;

type SortType = 'highest_spending' | 'lowest_spending' | 'alphabetical' | 'highest_usage';
type ActiveDropdown = 'mes' | 'ano' | 'uf' | 'partido' | 'sort' | null;

const MONTH_OPTIONS: DropdownOption[] = [
  { label: 'Janeiro', value: '1' },
  { label: 'Fevereiro', value: '2' },
  { label: 'Março', value: '3' },
  { label: 'Abril', value: '4' },
  { label: 'Maio', value: '5' },
  { label: 'Junho', value: '6' },
  { label: 'Julho', value: '7' },
  { label: 'Agosto', value: '8' },
  { label: 'Setembro', value: '9' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
];

const MONTH_LABEL_MAP = MONTH_OPTIONS.reduce<Record<number, string>>((acc, item) => {
  acc[Number(item.value)] = item.label;
  return acc;
}, {});

const SORT_OPTIONS: DropdownOption[] = [
  { label: 'Maior gasto', value: 'highest_spending' },
  { label: 'Menor gasto', value: 'lowest_spending' },
  { label: 'Ordem alfabética', value: 'alphabetical' },
  { label: 'Maior percentual de uso', value: 'highest_usage' },
];

const SORT_LABEL_MAP: Record<SortType, string> = {
  highest_spending: 'Maior gasto',
  lowest_spending: 'Menor gasto',
  alphabetical: 'Ordem A-Z',
  highest_usage: 'Maior % uso',
};

export const DeputadosScreen: React.FC = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const {
    items,
    loading,
    refreshing,
    loadingMore,
    syncing,
    error,
    errorType,
    message,
    messageTone,
    filters,
    setFilters,
    onRefresh,
    onLoadMore,
    deputyTotalsByMonth,
    loadedDeputyTotals,
    partidos,
    ufs,
    availableYears,
  } = useDeputadosScreen();

  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const keyExtractor = useCallback((item: (typeof items)[number]) => `${item.id}`, []);

  const applyAnimatedFilterUpdate = useCallback((updater: () => void) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updater();
  }, []);

  const ufOptions = useMemo<DropdownOption[]>(() => {
    return [{ label: 'Todos', value: '' }, ...ufs.map((uf) => ({ label: uf, value: uf }))];
  }, [ufs]);

  const partidoOptions = useMemo<DropdownOption[]>(() => {
    return [{ label: 'Todos', value: '' }, ...partidos.map((partido) => ({ label: partido, value: partido }))];
  }, [partidos]);
  const anoOptions = useMemo<DropdownOption[]>(() => {
    return availableYears.map((year) => ({ label: String(year), value: String(year) }));
  }, [availableYears]);

  const selectedMonthLabel = useMemo(() => MONTH_LABEL_MAP[filters.mes] ?? 'Mês inválido', [filters.mes]);

  const handleSelectUf = useCallback((value: string) => {
    applyAnimatedFilterUpdate(() => {
      setFilters((prev) => ({ ...prev, uf: value }));
    });
    setActiveDropdown(null);
  }, [applyAnimatedFilterUpdate, setFilters]);

  const handleSelectPartido = useCallback((value: string) => {
    applyAnimatedFilterUpdate(() => {
      setFilters((prev) => ({ ...prev, partido: value }));
    });
    setActiveDropdown(null);
  }, [applyAnimatedFilterUpdate, setFilters]);

  const handleSelectSort = useCallback((value: string) => {
    const nextSort = (value as SortType) || 'highest_spending';
    applyAnimatedFilterUpdate(() => {
      setFilters((prev) => ({ ...prev, sort: nextSort }));
    });
    setActiveDropdown(null);
  }, [applyAnimatedFilterUpdate, setFilters]);
  const handleSelectMonth = useCallback((value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 12) return;
    applyAnimatedFilterUpdate(() => {
      setFilters((prev) => ({ ...prev, mes: parsed }));
    });
    setActiveDropdown(null);
  }, [applyAnimatedFilterUpdate, setFilters]);

  const handleSelectYear = useCallback((value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    applyAnimatedFilterUpdate(() => {
      setFilters((prev) => ({ ...prev, ano: parsed }));
    });
    setActiveDropdown(null);
  }, [applyAnimatedFilterUpdate, setFilters]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof items)[number] }) => {
      const hasLoadedTotal = loadedDeputyTotals.has(item.id);
      const monthlyTotal = hasLoadedTotal ? Number(deputyTotalsByMonth[String(item.id)] ?? 0) : 0;

      return (
        <DeputyCard
          id={item.id}
          name={item.nome}
          party={item.partido}
          uf={item.uf}
          imageUri={toAbsoluteUrl(item.fotoUrl) ?? undefined}
          monthlySpent={monthlyTotal}
          onPress={(deputyId, deputyName) => {
            if (__DEV__) {
              // eslint-disable-next-line no-console
              console.log('[explorar->detail] period', { deputyId, ano: filters.ano, mes: filters.mes });
            }
            navigation.navigate('DeputadoDetail', {
              deputyId,
              deputyName,
              ano: filters.ano,
              mes: filters.mes,
            });
          }}
        />
      );
    },
    [deputyTotalsByMonth, filters.ano, filters.mes, loadedDeputyTotals, navigation],
  );
  const showBlockingError = Boolean(error && errorType === 'network' && !loading && items.length === 0);

  const header = useMemo(
    () => (
      <View style={styles.headerWrap}>
        <View style={styles.titleRow}>
          <AppText weight="bold" style={[styles.title, { color: theme.colors.text }]}>
            Explorar
          </AppText>
          <HeaderProfileButton
            iconSize={20}
            iconColor={theme.colors.iconAccent}
            containerStyle={[styles.profileCircle, { backgroundColor: theme.colors.iconCircle }]}
          />
        </View>

        <SearchInput
          value={filters.search}
          onChangeText={(value) => setFilters((prev) => ({ ...prev, search: value }))}
          onPressFilters={() => setActiveDropdown('sort')}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <FilterChip
            label={`Mês: ${selectedMonthLabel}`}
            selected
            onPress={() => setActiveDropdown('mes')}
          />
          <FilterChip
            label={`Ano: ${filters.ano}`}
            selected
            onPress={() => setActiveDropdown('ano')}
          />
          <FilterChip
            label={`UF: ${filters.uf || 'Todos'}`}
            selected={Boolean(filters.uf)}
            onPress={() => setActiveDropdown('uf')}
          />
          <FilterChip
            label={`Partido: ${filters.partido || 'Todos'}`}
            selected={Boolean(filters.partido)}
            onPress={() => setActiveDropdown('partido')}
          />
          <FilterChip
            label={`Gasto: ${SORT_LABEL_MAP[(filters.sort as SortType) || 'highest_spending']}`}
            selected={Boolean(filters.sort)}
            onPress={() => setActiveDropdown('sort')}
          />
        </ScrollView>

        {showBlockingError ? <ErrorBanner message={error ?? ''} onAction={onRefresh} /> : null}
        {!showBlockingError && message ? <Snackbar message={message} tone={messageTone} /> : null}
        {syncing ? <Snackbar message="Sincronizando base..." tone="warning" /> : null}
      </View>
    ),
    [error, filters.ano, filters.mes, filters.partido, filters.search, filters.sort, filters.uf, message, messageTone, onRefresh, selectedMonthLabel, setFilters, showBlockingError, syncing],
  );

  return (
    <ScreenBackground includeBottomInset={false}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        windowSize={9}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={40}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.35}
        onEndReached={onLoadMore}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <LoadingState label="Carregando deputados..." />
          ) : (
            <EmptyState
              title="Sem resultados"
              description="Ajuste os filtros para encontrar deputados."
              icon="account-search-outline"
            />
          )
        }
        ListFooterComponent={loadingMore ? <LoadingState label="Carregando mais..." /> : <View style={styles.footerSpace} />}
        renderItem={renderItem}
      />

      <DropdownFilter
        visible={activeDropdown === 'mes'}
        title="Selecionar mês"
        options={MONTH_OPTIONS}
        selectedValue={String(filters.mes)}
        onSelect={handleSelectMonth}
        onClose={() => setActiveDropdown(null)}
      />

      <DropdownFilter
        visible={activeDropdown === 'ano'}
        title="Selecionar ano"
        options={anoOptions}
        selectedValue={String(filters.ano)}
        onSelect={handleSelectYear}
        onClose={() => setActiveDropdown(null)}
      />

      <DropdownFilter
        visible={activeDropdown === 'uf'}
        title="Selecionar UF"
        options={ufOptions}
        selectedValue={filters.uf}
        onSelect={handleSelectUf}
        onClose={() => setActiveDropdown(null)}
      />

      <DropdownFilter
        visible={activeDropdown === 'partido'}
        title="Selecionar partido"
        options={partidoOptions}
        selectedValue={filters.partido}
        onSelect={handleSelectPartido}
        onClose={() => setActiveDropdown(null)}
      />

      <DropdownFilter
        visible={activeDropdown === 'sort'}
        title="Ordenar por"
        options={SORT_OPTIONS}
        selectedValue={(filters.sort as string) || 'highest_spending'}
        onSelect={handleSelectSort}
        onClose={() => setActiveDropdown(null)}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  headerWrap: {
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    lineHeight: 52,
  },
  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 6,
  },
  footerSpace: {
    height: 8,
  },
});
