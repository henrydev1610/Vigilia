import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useFavoritos } from '../../hooks';
import { toAbsoluteUrl } from '../../services/api';
import { fallbackFonts, useAppTheme } from '../../theme';
import { EmptyState, IconButton, ListItem, LoadingState, Screen, Snackbar } from '../../components/ui';
import { stableKeyFromDeputado } from '../../utils/keys';

export const FavoritesScreen: React.FC = () => {
  const theme = useAppTheme();
  const { items, loading, refreshing, error, load, removeFavorite } = useFavoritos();

  return (
    <Screen>
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
        Favoritos
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
        Deputados monitorados por você.
      </Text>

      {error ? <Snackbar message={error} tone="error" /> : null}
      {loading ? <LoadingState label="Carregando favoritos..." /> : null}

      {!loading && items.length === 0 ? (
        <EmptyState
          title="Nenhum favorito"
          description="Adicione deputados na tela de listagem para acompanhar com mais rapidez."
          icon="star-outline"
        />
      ) : null}

      {!loading ? (
        <FlatList
          data={items}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={theme.colors.primary} />}
          keyExtractor={(item) => stableKeyFromDeputado(item)}
          renderItem={({ item }) => (
            <ListItem
              title={item.nome ?? 'Deputado'}
              subtitle={`${item.siglaPartido ?? '--'} • ${item.siglaUf ?? '--'}`}
              imageUri={toAbsoluteUrl(item.urlFoto) ?? undefined}
              rightAction={<IconButton icon="trash-can-outline" tone="danger" onPress={() => removeFavorite(item)} />}
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
    marginBottom: 14,
    marginTop: 4,
  },
});
