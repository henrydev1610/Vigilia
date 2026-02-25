import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import { useDeputadosScreen } from '../../hooks';
import { toAbsoluteUrl } from '../../services/api';
import { formatCurrencyBRL } from '../../utils/format';
import { dedupeByKey } from '../../utils/keys';
import { DeputadoCard } from '../../components/DeputadoCard';
import { fallbackFonts, useAppTheme } from '../../theme';
import { CALENDAR_MONTH_OPTIONS, UI_STRINGS } from '../../constants/strings';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorBanner,
  Input,
  LoadingState,
  Screen,
  Select,
  Skeleton,
  Snackbar,
  StatCard,
} from '../../components/ui';
import { TrendChart } from '../../components/charts/TrendChart';

type Nav = StackNavigationProp<AppStackParamList, 'Tabs'>;

export const DeputadosScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const theme = useAppTheme();
  const {
    items,
    loading,
    refreshing,
    loadingMore,
    syncing,
    rateLimitedSeconds,
    error,
    message,
    favoriteIds,
    filters,
    setFilters,
    onRefresh,
    onLoadMore,
    toggleFavorite,
    syncDeputados,
    totalMes,
    deputyTotalsByMonth,
    loadedDeputyTotals,
    failedDeputyTotals,
    retryFailedTotals,
    aggregationProgress,
    chartPoints,
    chartLoading,
    partidos,
    ufs,
    availableYears,
  } = useDeputadosScreen();

  const renderCountRef = useRef(0);
  if (__DEV__) {
    renderCountRef.current += 1;
    if (renderCountRef.current <= 20 && renderCountRef.current % 5 === 0) {
      // eslint-disable-next-line no-console
      console.log(`[perf] DeputadosScreen renders=${renderCountRef.current}`);
    }
  }

  const partidoOptions = [{ label: 'Todos', value: '' }, ...partidos.map((partido) => ({ label: partido, value: partido }))];
  const partidoOptionsUnique = dedupeByKey(partidoOptions, (item) => item.value || '__all__');
  const anoOptions = availableYears.map((year) => ({ label: String(year), value: String(year) }));

  const keyExtractor = useCallback((item: (typeof items)[number]) => `${item.id}`, []);

  const renderItem = useCallback(({ item }: { item: (typeof items)[number] }) => {
    const isFavorite = favoriteIds.has(item.id);
    const hasLoadedTotal = loadedDeputyTotals.has(item.id);
    const monthlyTotal = deputyTotalsByMonth[String(item.id)];

    return (
      <DeputadoCard
        id={item.id}
        nome={item.nome}
        partido={item.partido}
        uf={item.uf}
        amountLabel={hasLoadedTotal ? formatCurrencyBRL(monthlyTotal ?? 0) : '--'}
        imageUri={toAbsoluteUrl(item.fotoUrl) ?? undefined}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onPress={(deputyId, deputyName) => navigation.navigate('DeputadoDetail', { deputyId, deputyName })}
      />
    );
  }, [deputyTotalsByMonth, favoriteIds, loadedDeputyTotals, navigation, toggleFavorite]);

  const listHeader = useMemo(() => (
    <View style={styles.headerWrap}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Deputados</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Resumo anual consolidado, filtros completos e lista monitorada.</Text>

      {error ? <ErrorBanner message={error} onAction={onRefresh} /> : null}
      {!error && message ? <Snackbar message={message} tone="success" /> : null}
      {!error && aggregationProgress ? <Snackbar message={aggregationProgress} tone="warning" /> : null}
      {!error && rateLimitedSeconds > 0 ? (
        <Snackbar
          message={UI_STRINGS.deputados.revalidateRateLimit.replace('{seconds}', String(rateLimitedSeconds))}
          tone="warning"
        />
      ) : null}
      {!error && failedDeputyTotals.length > 0 ? (
        <View style={styles.failedWrap}>
          <Snackbar message={`Falhou em ${failedDeputyTotals.length} itens.`} tone="warning" />
          <Button title="Reprocessar falhas" variant="secondary" onPress={retryFailedTotals} />
        </View>
      ) : null}

      <Card style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View style={styles.statCol}>
            <StatCard
              title={UI_STRINGS.deputados.totalGeralDoMes}
              value={formatCurrencyBRL(totalMes)}
              icon="cash-multiple"
              subtitle={`${filters.mes}/${filters.ano}`}
            />
          </View>
        </View>

        <View style={styles.selectRow}>
          <Select
            label="Ano"
            value={String(filters.ano)}
            options={anoOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, ano: Number(value) }))}
          />
          <Select
            label={UI_STRINGS.deputados.seletorMes}
            value={String(filters.mes)}
            options={CALENDAR_MONTH_OPTIONS}
            onChange={(value) => setFilters((prev) => ({ ...prev, mes: Number(value) }))}
          />
        </View>

        {chartLoading ? (
          <View style={styles.chartSkeletonWrap}>
            <Skeleton height={22} width="50%" style={styles.chartSkeletonTitle} />
            <Skeleton height={160} width="100%" />
          </View>
        ) : (
          <TrendChart points={chartPoints} formatValue={formatCurrencyBRL} />
        )}
      </Card>

      <Button
        title="Sincronizar base"
        onPress={syncDeputados}
        loading={syncing}
        disabled={syncing || rateLimitedSeconds > 0}
        accessibilityLabel="Sincronizar base de deputados"
        style={styles.syncButton}
      />

      <Input
        value={filters.search}
        onChangeText={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        label="Buscar por nome"
        placeholder="Ex: Erika Hilton"
      />

      {!error ? (
        <Select
          label="Partido"
          value={filters.partido}
          options={partidoOptionsUnique}
          onChange={(value) => setFilters((prev) => ({ ...prev, partido: value }))}
        />
      ) : null}

      {!error ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ufRow}>
          <Chip
            label="Todas"
            selected={!filters.uf}
            onPress={() => setFilters((prev) => ({ ...prev, uf: '' }))}
          />
          {ufs.map((uf) => (
            <Chip
              key={uf}
              label={uf}
              selected={filters.uf === uf}
              onPress={() => setFilters((prev) => ({ ...prev, uf: prev.uf === uf ? '' : uf }))}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  ), [aggregationProgress, anoOptions, chartLoading, chartPoints, error, failedDeputyTotals.length, filters, message, onRefresh, partidoOptionsUnique, retryFailedTotals, setFilters, syncDeputados, syncing, theme.colors.text, theme.colors.textSecondary, totalMes, ufs]);

  return (
    <Screen includeBottomInset={false}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        getItemLayout={(_, index) => ({ length: 94, offset: 94 * index, index })}
        windowSize={9}
        initialNumToRender={12}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.35}
        onEndReached={onLoadMore}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? (
            <LoadingState label="Carregando deputados..." />
          ) : (
            <EmptyState
              title="Sem resultados"
              description="Ajuste filtros ou sincronize novamente a base de dados."
              icon="account-search-outline"
            />
          )
        }
        ListFooterComponent={loadingMore ? <LoadingState label="Carregando mais..." /> : <View style={styles.footerSpace} />}
        renderItem={renderItem}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 30,
  },
  headerWrap: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    marginTop: 4,
  },
  subtitle: {
    marginBottom: 10,
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 10,
  },
  summaryTopRow: {
    marginBottom: 4,
  },
  statCol: {
    flex: 1,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    marginBottom: 10,
  },
  ufRow: {
    gap: 6,
    paddingVertical: 4,
  },
  footerSpace: {
    height: 14,
  },
  chartSkeletonWrap: {
    gap: 8,
    marginTop: 8,
  },
  chartSkeletonTitle: {
    borderRadius: 8,
  },
  failedWrap: {
    gap: 8,
    marginBottom: 8,
  },
});


