import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Badge, Button, Card, Divider, Screen } from '../components/ui';

export const ExpenseDetailScreen: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Detalhe da Despesa</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Visual premium de uma despesa parlamentar.</Text>

      <Card>
        <Text style={[styles.headline, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Auto Posto Federal</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>CNPJ 12.345.678/0001-00</Text>
        <Text style={[styles.value, { color: theme.colors.primary, fontFamily: fallbackFonts.headingBold }]}>{formatCurrency(1240.5)}</Text>

        <View style={styles.badges}>
          <Badge label="Atividade Parlamentar" tone="success" />
          <Badge label="12/02/2026" tone="default" />
        </View>

        <Divider />

        <Text style={[styles.meta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Documento NF-92018</Text>
        <Text style={[styles.meta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Forma de pagamento: Cartão corporativo</Text>

        <View style={styles.actions}>
          <Button title="Ver PDF" variant="ghost" style={styles.action} />
          <Button title="Compartilhar" variant="secondary" style={styles.action} />
        </View>
      </Card>
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
  headline: {
    fontSize: 18,
  },
  meta: {
    marginTop: 4,
  },
  value: {
    fontSize: 28,
    marginTop: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  action: {
    flex: 1,
  },
});
