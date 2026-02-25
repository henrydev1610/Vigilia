import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { rankings } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Badge, Chip, ListItem, Screen, StatCard } from '../components/ui';

type RankingTab = 'maiores' | 'economicos' | 'partidos';

export const RankingScreen: React.FC = () => {
  const theme = useAppTheme();
  const [tab, setTab] = useState<RankingTab>('maiores');

  const ordered = useMemo(() => {
    if (tab === 'economicos') {
      return [...rankings].sort((a, b) => a.amount - b.amount);
    }
    if (tab === 'partidos') {
      return [...rankings].sort((a, b) => a.party.localeCompare(b.party));
    }
    return rankings;
  }, [tab]);

  const total = useMemo(() => ordered.reduce((acc, item) => acc + item.amount, 0), [ordered]);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Ranking de Despesas</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Atualizado em tempo real com base monitorada.</Text>

      <View style={styles.tabs}>
        <Chip label="Maiores" selected={tab === 'maiores'} onPress={() => setTab('maiores')} />
        <Chip label="Econômicos" selected={tab === 'economicos'} onPress={() => setTab('economicos')} />
        <Chip label="Partidos" selected={tab === 'partidos'} onPress={() => setTab('partidos')} />
      </View>

      <StatCard title="Total monitorado" value={formatCurrency(total)} icon="chart-areaspline" subtitle="Todos os itens" />

      <FlatList
        data={ordered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ListItem
            title={`#${index + 1} ${item.name}`}
            subtitle={`${item.party} • ${item.state}`}
            amount={formatCurrency(item.amount)}
            rightAction={<Badge label={`${item.quotaPercent}%`} tone="success" />}
          />
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginTop: 8,
  },
  subtitle: {
    marginBottom: 12,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
});
