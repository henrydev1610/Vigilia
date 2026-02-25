import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/ui';
import {
  CategoryBarsCard,
  DashboardHeader,
  StateListCard,
  StatCardMain,
  StatCardSmall,
} from '../../components/dashboard';
import { dashboardSeed } from '../../data/dashboardSeed';
import { getDashboardData } from '../../storage/dashboardStorage';
import { DashboardData } from '../../types/dashboard';

export const DashboardScreen: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData>(dashboardSeed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const loaded = await getDashboardData();
      if (!active) {
        return;
      }
      setDashboard(loaded);
      setHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen padded={false} includeBottomInset={false} contentStyle={styles.screenContent}>
      <LinearGradient colors={['#060E13', '#040B08', '#050B0E']} style={styles.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, !hydrated ? styles.loadingState : null]}>
          <DashboardHeader />

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
              line1={`+${dashboard.yearDeltaPct.toFixed(1)}%`}
              line1Tone="red"
              line2="Acima da inflação"
              line2Tone="muted"
              showAlertIcon
            />
          </View>

          <CategoryBarsCard items={dashboard.categories} />
          <StateListCard totalLabel={dashboard.statesTotalLabel} items={dashboard.states} />
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
  loadingState: {
    opacity: 0.98,
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

