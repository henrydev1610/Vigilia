import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { politicians } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Chip, Input, ListItem, Screen } from '../components/ui';

export const ExploreScreen: React.FC = () => {
  const theme = useAppTheme();
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const uf = stateFilter.trim().toLowerCase();
    return politicians.filter((item) => {
      if (normalized && !item.name.toLowerCase().includes(normalized)) return false;
      if (uf && item.state.toLowerCase() !== uf) return false;
      return true;
    });
  }, [query, stateFilter]);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Explorar</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Busque parlamentares por nome e UF.</Text>

      <Input value={query} onChangeText={setQuery} label="Busca" placeholder="Ex: Maria Costa" />

      <View style={styles.row}>
        {['', 'SP', 'RJ', 'MG', 'BA'].map((uf) => (
          <Chip key={uf || 'all'} label={uf || 'Todos'} selected={stateFilter === uf} onPress={() => setStateFilter(uf)} />
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={`${item.party} • ${item.state}`}
            amount={formatCurrency(item.quotaUsed)}
            badge={`${item.quotaPercent}%`}
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
});
