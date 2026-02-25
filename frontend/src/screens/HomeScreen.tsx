import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { politicians } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Card, ListItem, Screen, StatCard } from '../components/ui';

export const HomeScreen: React.FC = () => {
  const theme = useAppTheme();

  const total = politicians.reduce((acc, item) => acc + item.quotaUsed, 0);
  const avgPercent = politicians.reduce((acc, item) => acc + item.quotaPercent, 0) / politicians.length;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Painel de Transparência</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Resumo premium dos gastos parlamentares monitorados.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <StatCard title="Total monitorado" value={formatCurrency(total)} icon="cash-multiple" subtitle="Mês atual" />
          </View>
          <View style={styles.statCol}>
            <StatCard title="Uso médio" value={`${avgPercent.toFixed(0)}%`} icon="chart-donut" subtitle="Cota CEAP" />
          </View>
        </View>

        <Card>
          <View style={styles.sectionHeader}>
            <Icon name="shield-check-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Parlamentares em destaque</Text>
          </View>

          {politicians.slice(0, 3).map((item) => (
            <ListItem
              key={item.id}
              title={item.name}
              subtitle={`${item.party} • ${item.state}`}
              amount={formatCurrency(item.quotaUsed)}
              badge={`${item.quotaPercent}% da cota`}
            />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    marginTop: 8,
  },
  subtitle: {
    marginBottom: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statCol: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
  },
});
