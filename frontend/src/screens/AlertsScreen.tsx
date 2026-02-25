import React, { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { alerts } from '../data/mockData';
import { fallbackFonts, useAppTheme } from '../theme';
import { Badge, Button, Card, ListItem, Screen } from '../components/ui';

export const AlertsScreen: React.FC = () => {
  const theme = useAppTheme();
  const [enabled, setEnabled] = useState(true);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Favoritos e Alertas</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Receba notificações sobre despesas dos monitorados.</Text>

      <Card style={styles.toggleCard}>
        <Text style={{ color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }}>Alertas em tempo real</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </Card>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={`${item.party} • ${item.state}`}
            rightAction={
              item.status === 'none' ? (
                <Badge label="Sem alertas" tone="default" />
              ) : item.status === 'atypical' ? (
                <Badge label="Atenção" tone="warning" />
              ) : (
                <Badge label="Nova despesa" tone="success" />
              )
            }
          />
        )}
        ListFooterComponent={<Button title="Adicionar parlamentar" variant="ghost" style={styles.footerBtn} />}
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
  toggleCard: {
    marginBottom: 10,
  },
  footerBtn: {
    marginBottom: 24,
    marginTop: 6,
  },
});
