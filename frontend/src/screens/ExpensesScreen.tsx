import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { expenses } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Badge, Card, Screen } from '../components/ui';

export const ExpensesScreen: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Gastos</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Últimos lançamentos registrados.</Text>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[styles.itemTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{item.description}</Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>{item.date}</Text>
            <Text style={[styles.amount, { color: theme.colors.primary, fontFamily: fallbackFonts.heading }]}>{formatCurrency(item.amount)}</Text>
            <Badge label={item.category} tone="default" />
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
  card: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
  },
  meta: {
    marginBottom: 8,
    marginTop: 4,
  },
  amount: {
    fontSize: 18,
    marginBottom: 8,
  },
});
