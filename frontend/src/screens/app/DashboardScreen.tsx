import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorBanner, LoadingState, Screen } from '../../components/ui';
import {
  CategoryBarsCard,
  DashboardHeader,
  StateListCard,
  StatCardMain,
  StatCardSmall,
} from '../../components/dashboard';
import { useDashboardSummary } from '../../hooks';

export const DashboardScreen: React.FC = () => {
  const { dashboard, loading, refreshing, error, refresh } = useDashboardSummary();

  const annualLine1 = useMemo(() => {
    const value = Number(dashboard.yearDeltaPct || 0);
    const signal = value > 0 ? '+' : '';
    return `${signal}${value.toFixed(1)}%`;
  }, [dashboard.yearDeltaPct]);

  const annualLine1Tone = dashboard.yearDeltaPct > 0 ? 'red' : 'default';
  const annualLine2Tone = dashboard.yearDeltaPct > 0 ? 'red' : 'green';

  const rankingItems = useMemo(() => {
    return dashboard.ranking.map((item) => ({
      name: `${item.name} (${item.party}/${item.uf})`,
      valueLabel: item.valueLabel,
      progress: item.progress,
    }));
  }, [dashboard.ranking]);

  return (
    <Screen padded={false} includeBottomInset={false} contentStyle={styles.screenContent}>
      <LinearGradient colors={['#060E13', '#040B08', '#050B0E']} style={styles.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#22D663" />}
      >
        <View style={styles.inner}>
          <DashboardHeader alertsCount={dashboard.alertsCount} />
          {error ? <ErrorBanner message={error} onAction={() => void refresh()} /> : null}
          {loading ? <LoadingState label="Carregando indicadores do dashboard..." /> : null}

          <StatCardMain monthTotal={dashboard.monthTotal} monthDeltaPct={dashboard.monthDeltaPct} />

          <View style={styles.smallCardsRow}>
            <StatCardSmall
              title="MAIOR GASTO"
              line1={dashboard.topSpender.name}
              line2={dashboard.topSpender.amountLabel.replace(' ', '')}
              line2Tone="green"
            />
            <StatCardSmall
              title="VARIAÇÃO ANUAL"
              line1={annualLine1}
              line1Tone={annualLine1Tone}
              line2="vs mesmo período do ano anterior"
              line2Tone={annualLine2Tone}
              showAlertIcon
            />
          </View>

          <CategoryBarsCard items={dashboard.categories} />
          <StateListCard
            title="Ranking do Mês"
            icon="podium-gold"
            totalLabel={dashboard.rankingTotalLabel}
            items={rankingItems}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    paddingBottom: 24,
  },
  inner: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
