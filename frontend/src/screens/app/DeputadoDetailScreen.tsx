import React from 'react';
import { FlatList, Image, Linking, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppStackParamList } from '../../navigation/types';
import { useDeputadoDetailScreen } from '../../hooks';
import { toAbsoluteUrl } from '../../services/api';
import { formatCurrencyBRL, formatDateBR } from '../../utils/format';
import { fallbackFonts, useAppTheme } from '../../theme';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ListItem,
  LoadingState,
  Screen,
  Select,
  Skeleton,
  Snackbar,
  StatCard,
} from '../../components/ui';
import { TrendChart } from '../../components/charts/TrendChart';
import { ExpenseDetailModal } from '../../components/deputados/ExpenseDetailModal';
import { CALENDAR_MONTH_OPTIONS, UI_STRINGS } from '../../constants/strings';

type DetailRoute = RouteProp<AppStackParamList, 'DeputadoDetail'>;

function expenseTone(label: string): 'default' | 'success' | 'warning' | 'danger' {
  const normalized = label.toLowerCase();
  if (normalized.includes('combust')) return 'warning';
  if (normalized.includes('passag')) return 'success';
  if (normalized.includes('multa')) return 'danger';
  return 'default';
}

export const DeputadoDetailScreen: React.FC = () => {
  const route = useRoute<DetailRoute>();
  const theme = useAppTheme();
  const { deputyId } = route.params;

  const {
    deputy,
    expenses,
    selectedExpense,
    setSelectedExpenseId,
    ano,
    mes,
    setAno,
    setMes,
    expenseTypeMap,
    monthlyTotal,
    monthlyTotalLoading,
    chartPoints,
    chartLoading,
    loading,
    refreshing,
    loadingMore,
    error,
    applyFilters,
    onLoadMore,
    syncExpenses,
    syncing,
  } = useDeputadoDetailScreen(deputyId);

  const yearOptions = Array.from({ length: 4 }, (_, index) => {
    const year = new Date().getFullYear() - index;
    return { label: String(year), value: String(year) };
  });

  async function handleOpenPdf(url: string | null) {
    const absolute = toAbsoluteUrl(url);
    if (!absolute) return;
    const canOpen = await Linking.canOpenURL(absolute);
    if (canOpen) {
      await Linking.openURL(absolute);
    }
  }

  return (
    <Screen>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: 174, offset: 174 * index, index })}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={applyFilters} tintColor={theme.colors.primary} />}
        onEndReachedThreshold={0.35}
        onEndReached={onLoadMore}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.profileHeader}>
              {deputy?.fotoUrl ? <Image source={{ uri: toAbsoluteUrl(deputy.fotoUrl) ?? deputy.fotoUrl }} style={styles.avatar} /> : <View style={styles.avatarFallback} />}
              <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{deputy?.nome ?? route.params.deputyName ?? 'Deputado'}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>{`${deputy?.partido ?? '--'} • ${deputy?.uf ?? '--'}`}</Text>
            </View>

            {error ? <Snackbar message={error} tone="error" /> : null}

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                {monthlyTotalLoading ? (
                  <Card style={styles.statSkeletonCard}>
                    <Skeleton height={12} width="45%" />
                    <Skeleton height={28} width="70%" style={styles.statSkeletonValue} />
                    <Skeleton height={12} width="35%" style={styles.statSkeletonSubtitle} />
                  </Card>
                ) : (
                  <StatCard title={UI_STRINGS.deputadoDetalhe.totalNoMes} value={formatCurrencyBRL(monthlyTotal)} icon="cash-multiple" subtitle={`${mes}/${ano}`} />
                )}
              </View>
              <View style={styles.statCol}>
                <StatCard title="Despesas" value={String(expenses.length)} icon="receipt-text-outline" subtitle="Itens carregados" />
              </View>
            </View>

            <Card style={styles.chartCard}>
              <Text style={[styles.chartTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{UI_STRINGS.deputadoDetalhe.evolucaoMensalNoAno}</Text>
              {chartLoading ? <LoadingState label="Calculando totais mensais..." /> : <TrendChart points={chartPoints} formatValue={formatCurrencyBRL} />}
            </Card>

            <View style={styles.filterRow}>
              <Select label="Ano" value={ano} options={yearOptions} onChange={setAno} />
              <Select label={UI_STRINGS.deputadoDetalhe.seletorMes} value={mes} options={CALENDAR_MONTH_OPTIONS} onChange={setMes} />
            </View>

            <View style={styles.actions}>
              <Button title="Aplicar" onPress={applyFilters} style={styles.actionBtn} />
              <Button title="Sincronizar" onPress={syncExpenses} loading={syncing} variant="secondary" style={styles.actionBtn} />
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState label="Carregando despesas..." />
          ) : (
            <EmptyState title={UI_STRINGS.deputadoDetalhe.semDespesas} description={UI_STRINGS.deputadoDetalhe.semDespesasDescricao} icon="receipt-text-remove-outline" />
          )
        }
        ListFooterComponent={loadingMore ? <LoadingState label="Carregando mais..." /> : null}
        renderItem={({ item }) => {
          const friendlyType = expenseTypeMap.get(item.tipo) ?? item.tipo;
          return (
            <Card style={styles.expenseCard}>
              <ListItem
                title={friendlyType}
                subtitle={`${item.fornecedor} • ${formatDateBR(item.data)}`}
                amount={formatCurrencyBRL(item.valor)}
                trailingIcon="chevron-right"
                onPress={() => setSelectedExpenseId(item.id)}
              />
              <View style={styles.badgesRow}>
                <Badge label={friendlyType} tone={expenseTone(friendlyType)} />
                <Badge label={`${item.mes || '--'}/${item.ano || '--'}`} tone="default" />
                {item.cnpjCpf ? <Badge label={item.cnpjCpf} tone="default" /> : null}
              </View>
            </Card>
          );
        }}
      />

      <ExpenseDetailModal
        visible={Boolean(selectedExpense)}
        expense={selectedExpense}
        onClose={() => setSelectedExpenseId(null)}
        onOpenPdf={handleOpenPdf}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  avatar: {
    borderRadius: 42,
    height: 84,
    width: 84,
  },
  avatarFallback: {
    backgroundColor: '#243327',
    borderRadius: 42,
    height: 84,
    width: 84,
  },
  title: {
    fontSize: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCol: {
    flex: 1,
  },
  statSkeletonCard: {
    gap: 8,
    minHeight: 88,
  },
  statSkeletonValue: {
    borderRadius: 8,
  },
  statSkeletonSubtitle: {
    borderRadius: 8,
  },
  chartCard: {
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
  },
  expenseCard: {
    marginBottom: 10,
    padding: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
});
