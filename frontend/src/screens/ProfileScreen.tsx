import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../theme';
import { Button, Card, Chip, Divider, Screen } from '../components/ui';

export const ProfileScreen: React.FC = () => {
  const theme = useAppTheme();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [bioEnabled, setBioEnabled] = useState(true);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Meu Perfil</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Preferências e segurança da conta.</Text>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>Partidos monitorados</Text>
          <View style={styles.row}><Chip label="PT" selected /><Chip label="PL" /><Chip label="PSDB" /></View>

          <Divider />

          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }}>Alertas de gastos</Text>
            <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} />
          </View>
          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }}>Biometria/Face ID</Text>
            <Switch value={bioEnabled} onValueChange={setBioEnabled} />
          </View>

          <View style={styles.actions}>
            <Button title="Salvar" style={styles.action} />
            <Button title="Encerrar sessão" variant="danger" style={styles.action} />
          </View>
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
  card: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
});
