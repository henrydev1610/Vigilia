import React from 'react';
import { FlatList, Linking, Share, StyleSheet, Text, View } from 'react-native';
import { expenses } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Badge, Button, Card, ListItem, Screen, StatCard } from '../components/ui';

export const PoliticianDetailScreen: React.FC = () => {
  const theme = useAppTheme();

  async function openDoc() {
    const url = 'https://www.camara.leg.br';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }

  async function shareDoc() {
    await Share.share({ message: 'https://www.camara.leg.br' });
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Detalhes do Parlamentar</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Perfil consolidado com despesas recentes.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCol}><StatCard title="Resumo mensal" value={formatCurrency(184000)} icon="cash" subtitle="Fev/2026" /></View>
        <View style={styles.statCol}><StatCard title="Execução da cota" value="80%" icon="chart-line" subtitle="Mandato atual" /></View>
      </View>

      <Card style={styles.card}>
        <ListItem title="Dep. João Silva" subtitle="PT • SP" badge="Em exercício" amount={formatCurrency(184000)} />
        <View style={styles.badges}>
          <Badge label="Mandato 2023-2027" tone="success" />
          <Badge label="Parlamentar verificado" tone="default" />
        </View>

        <View style={styles.actions}>
          <Button title="Ver PDF/Nota" variant="ghost" style={styles.action} onPress={openDoc} />
          <Button title="Compartilhar" variant="secondary" style={styles.action} onPress={shareDoc} />
        </View>
      </Card>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[styles.expTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{item.description}</Text>
            <Text style={[styles.expMeta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>{item.date}</Text>
            <Text style={[styles.expValue, { color: theme.colors.primary, fontFamily: fallbackFonts.heading }]}>{formatCurrency(item.amount)}</Text>
          </Card>
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statCol: {
    flex: 1,
  },
  card: {
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  action: {
    flex: 1,
  },
  expTitle: {
    fontSize: 14,
  },
  expMeta: {
    marginTop: 4,
  },
  expValue: {
    fontSize: 18,
    marginTop: 6,
  },
});
