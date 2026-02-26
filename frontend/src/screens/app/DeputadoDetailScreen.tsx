import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Linking, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDeputadoDetailScreen } from '../../hooks';
import { DeputadosStackParamList } from '../../navigation/types';
import { toAbsoluteUrl } from '../../services/api';
import { formatCurrencyBRL } from '../../utils/format';
import { useAppTheme } from '../../theme';
import { EmptyState, GreenGridBackground, LoadingState, Skeleton, Snackbar } from '../../components/ui';
import {
  DetailHeader,
  ExpenseCard,
  ExpenseDetailBottomSheet,
  MonthYearPickerModal,
  MonthlySummary,
  ParliamentProfileHeader,
  SpendingChart,
} from '../../components/parliament-detail';

type DetailRoute = RouteProp<DeputadosStackParamList, 'DeputadoDetail'>;
type DetailNav = StackNavigationProp<DeputadosStackParamList, 'DeputadoDetail'>;

const MONTHS_FULL = ['JANEIRO', 'FEVEREIRO', 'MARCO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const MONTHS_SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function extractLocalYmd(value: string) {
  const direct = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (direct) {
    return `${direct[1]}-${direct[2]}-${direct[3]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatExpenseDate(value: string) {
  const ymd = extractLocalYmd(value);
  if (!ymd) return '--';
  const [year, month, day] = ymd.split('-');
  const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
  return `${day} ${MONTHS_SHORT[monthIndex]} ${year}`;
}

export const DeputadoDetailScreen: React.FC = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNav>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { deputyId } = route.params;

  const {
    deputy,
    expenses,
    chartExpenses,
    selectedExpense,
    setSelectedExpenseId,
    ano,
    mes,
    expenseTypeMap,
    monthlyTotal,
    monthlyTotalLoading,
    chartLoading,
    loading,
    refreshing,
    error,
    applyFilters,
    onLoadMore,
  } = useDeputadoDetailScreen(deputyId);

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [isPeriodPickerVisible, setIsPeriodPickerVisible] = useState(false);

  const selectedYear = Math.max(2000, Number(ano) || new Date().getFullYear());
  const selectedMonth = Math.min(12, Math.max(1, Number(mes) || new Date().getMonth() + 1));
  const totalLabel = `TOTAL ${MONTHS_FULL[selectedMonth - 1]}`;
  const periodLabel = `${MONTHS_SHORT[selectedMonth - 1]}/${selectedYear}`;

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [expenses]);

  const dailyChartPoints = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const totalsByDay = new Array<number>(daysInMonth).fill(0);

    chartExpenses.forEach((item) => {
      const ymd = extractLocalYmd(item.data);
      if (!ymd) return;
      const [year, month, day] = ymd.split('-').map((entry) => Number(entry));
      if (year !== selectedYear || month !== selectedMonth) return;
      if (day < 1 || day > daysInMonth) return;
      totalsByDay[day - 1] += Number(item.valor || 0);
    });

    return totalsByDay.map((value, index) => ({
      key: `${selectedYear}-${selectedMonth}-${index + 1}`,
      label: String(index + 1),
      value,
    }));
  }, [chartExpenses, selectedMonth, selectedYear]);

  const selectedExpenseSheetData = useMemo(() => {
    if (!selectedExpense) return null;
    return {
      title: expenseTypeMap.get(selectedExpense.tipo) ?? selectedExpense.tipo,
      valueLabel: formatCurrencyBRL(selectedExpense.valor),
      pdfUrl: toAbsoluteUrl(selectedExpense.pdfUrl) ?? selectedExpense.pdfUrl,
    };
  }, [expenseTypeMap, selectedExpense]);

  const handleOpenPdf = useCallback(async (url: string | null) => {
    const absoluteUrl = toAbsoluteUrl(url) ?? url;
    if (!absoluteUrl) return;
    const canOpen = await Linking.canOpenURL(absoluteUrl);
    if (canOpen) await Linking.openURL(absoluteUrl);
  }, []);

  const handleShareScreen = useCallback(async () => {
    const deputyName = deputy?.nome ?? route.params.deputyName ?? 'Parlamentar';
    if (selectedExpenseSheetData?.pdfUrl) {
      await Share.share({
        message: `${deputyName}\n${selectedExpenseSheetData.title}\n${selectedExpenseSheetData.valueLabel}\n${selectedExpenseSheetData.pdfUrl}`,
      });
      return;
    }

    await Share.share({
      message: `${deputyName} - ${deputy?.partido ?? '--'} - ${deputy?.uf ?? '--'}`,
    });
  }, [deputy?.nome, deputy?.partido, deputy?.uf, route.params.deputyName, selectedExpenseSheetData]);

  const handleSelectExpense = useCallback(
    (expenseId: string) => {
      setSelectedExpenseId(expenseId);
      setIsSheetVisible(true);
    },
    [setSelectedExpenseId],
  );

  const handleCloseSheet = useCallback(() => {
    setIsSheetVisible(false);
    setSelectedExpenseId(null);
  }, [setSelectedExpenseId]);

  const handleViewAll = useCallback(() => {
    navigation.getParent()?.navigate('Gastos');
  }, [navigation]);

  const handleConfirmPeriod = useCallback(async (next: { month: number; year: number }) => {
    await applyFilters({
      ano: String(next.year),
      mes: String(next.month),
    });
    setIsPeriodPickerVisible(false);
  }, [applyFilters]);

  const listHeader = useMemo(() => (
    <View>
      <ParliamentProfileHeader
        avatarUrl={deputy?.fotoUrl ?? null}
        mandateLabel={deputy?.idLegislatura ? `Legislatura ${deputy.idLegislatura}` : 'Mandato vigente'}
        name={deputy?.nome ?? route.params.deputyName ?? 'Deputado'}
        party={deputy?.partido ?? '--'}
        statusLabel={deputy?.situacao ?? 'Situacao nao informada'}
        uf={deputy?.uf ?? '--'}
      />

      {error ? <Snackbar message={error} tone="error" /> : null}

      <MonthlySummary
        totalLabel={totalLabel}
        totalValue={formatCurrencyBRL(monthlyTotal)}
        periodLabel={periodLabel}
        loading={monthlyTotalLoading}
        onOpenPeriodPicker={() => setIsPeriodPickerVisible(true)}
      />

      {chartLoading ? (
        <View style={styles.chartSkeletonWrap}>
          <Skeleton height={220} style={styles.chartSkeleton} />
        </View>
      ) : (
        <SpendingChart points={dailyChartPoints} xLabelStep={5} />
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ultimas Despesas</Text>
        <Text onPress={handleViewAll} style={styles.sectionLink}>
          Ver todas
        </Text>
      </View>
    </View>
  ), [
    chartLoading,
    dailyChartPoints,
    deputy?.fotoUrl,
    deputy?.idLegislatura,
    deputy?.nome,
    deputy?.partido,
    deputy?.situacao,
    deputy?.uf,
    error,
    handleViewAll,
    monthlyTotal,
    monthlyTotalLoading,
    periodLabel,
    route.params.deputyName,
    totalLabel,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <GreenGridBackground />
        <View style={styles.loaderWrap}>
          <LoadingState label="Carregando detalhes do parlamentar..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GreenGridBackground />
      <View style={styles.container}>
        <DetailHeader onBack={() => navigation.goBack()} onShare={handleShareScreen} />

        <FlatList
          data={sortedExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const readableType = expenseTypeMap.get(item.tipo) ?? item.tipo;
            const invoiceNumber = item.numeroDocumento?.trim() || item.id.slice(0, 6);
            return (
              <ExpenseCard
                dateLabel={formatExpenseDate(item.data)}
                invoiceLabel={`NF:${invoiceNumber}`}
                onPress={() => handleSelectExpense(item.id)}
                supplierLabel={item.fornecedor?.trim() || 'Fornecedor nao informado'}
                title={readableType}
                valueLabel={formatCurrencyBRL(item.valor)}
              />
            );
          }}
          onEndReachedThreshold={0.4}
          onEndReached={onLoadMore}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void applyFilters()} tintColor="#1DE26D" />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListFooterComponent={<View style={{ height: insets.bottom + 96 }} />}
          ListEmptyComponent={
            <EmptyState
              title="Sem despesas recentes"
              description="Nao ha despesas carregadas para este periodo."
              icon="receipt-text-remove-outline"
            />
          }
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={9}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews
        />
      </View>

      <ExpenseDetailBottomSheet
        visible={isSheetVisible && Boolean(selectedExpense)}
        expense={selectedExpenseSheetData}
        onClose={handleCloseSheet}
        onDownloadPdf={() => {
          void handleOpenPdf(selectedExpense?.pdfUrl ?? null);
        }}
      />

      <MonthYearPickerModal
        visible={isPeriodPickerVisible}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onClose={() => setIsPeriodPickerVisible(false)}
        onConfirm={(next) => {
          void handleConfirmPeriod(next);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#06160F',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 4,
  },
  chartSkeletonWrap: {
    marginTop: 14,
  },
  chartSkeleton: {
    borderRadius: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: '#E6F4EB',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.35,
  },
  sectionLink: {
    color: '#1EE06C',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
});
