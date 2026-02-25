import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRanking } from '../../hooks';
import { formatCurrency } from '../../utils/format';
import { fallbackFonts, useAppTheme } from '../../theme';
import {
  Badge,
  Button,
  Chip,
  EmptyState,
  Input,
  ListItem,
  LoadingState,
  Screen,
  Snackbar,
} from '../../components/ui';
import { stableKeyFromDeputado } from '../../utils/keys';

export const RankingScreen: React.FC = () => {
  const theme = useAppTheme();
  const {
    mode,
    setMode,
    ano,
    setAno,
    mes,
    setMes,
    limit,
    setLimit,
    loading,
    refreshing,
    items,
    error,
    load,
  } = useRanking();

  return (
    <Screen includeBottomInset={false}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontFamily: fallbackFonts.headingBold,
            fontSize: theme.typography.size.h2,
            lineHeight: theme.typography.lineHeight.h2,
          },
        ]}
      >
        Ranking de Gastos
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.textSecondary,
            fontFamily: fallbackFonts.body,
            fontSize: theme.typography.size.body,
            lineHeight: theme.typography.lineHeight.body,
          },
        ]}
      >
        Classificação CEAP/CECAP com filtros de período.
      </Text>

      <View style={styles.modeRow}>
        <Chip label="CEAP" selected={mode === 'ceap'} onPress={() => setMode('ceap')} />
        <Chip label="CECAP" selected={mode === 'cecap'} onPress={() => setMode('cecap')} />
      </View>

      <View style={styles.filters}>
        <View style={styles.filterInput}><Input label="Ano" value={ano} onChangeText={setAno} keyboardType="numeric" /></View>
        <View style={styles.filterInput}><Input label="Mês" value={mes} onChangeText={setMes} keyboardType="numeric" /></View>
        <View style={styles.filterInput}><Input label="Limite" value={limit} onChangeText={setLimit} keyboardType="numeric" /></View>
      </View>

      <Button title="Atualizar" onPress={() => load()} style={styles.refreshButton} />
      {error ? <Snackbar message={error} tone="error" /> : null}
      {loading ? <LoadingState label="Carregando ranking..." /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState title="Sem dados" description="Nenhum registro encontrado para os filtros selecionados." icon="chart-line-variant" />
      ) : null}

      {!loading ? (
        <FlatList
          data={items}
          keyExtractor={(item) => stableKeyFromDeputado(item)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.colors.primary} />}
          renderItem={({ item, index }) => (
            <ListItem
              title={`#${index + 1} ${item.nome}`}
              subtitle={`${item.partido ?? '--'} • ${item.uf ?? '--'}`}
              amount={formatCurrency(item.total)}
              imageUri={item.urlFoto}
              rightAction={<Badge label={mode.toUpperCase()} tone="success" />}
            />
          )}
        />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
  },
  subtitle: {
    marginBottom: 12,
    marginTop: 4,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterInput: {
    flex: 1,
  },
  refreshButton: {
    marginBottom: 10,
  },
});

