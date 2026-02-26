import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRanking } from '../../hooks';
import { toAbsoluteUrl } from '../../services/api';
import { designSystem } from '../../theme';
import {
  RankingCard,
  RankingFooterSummary,
  RankingHeader,
  SearchInput,
  SegmentTabKey,
  SegmentTabs,
} from '../../components/ranking';
import { EmptyState, LoadingState, ScreenBackground, Snackbar } from '../../components/ui';

type RankingRow = {
  key: string;
  name: string;
  subtitle: string;
  amount: number;
  imageUri?: string;
  progress: number;
};

const RANKING_LIMIT = 550000;
const TAB_BAR_BASE_HEIGHT = 64;
const TAB_BAR_MIN_BOTTOM_GAP = 6;
const SUMMARY_HEIGHT = 72;
const SUMMARY_MARGIN = 10;

function formatNoCentsBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatMonitorValue(value: number): string {
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(1)} Bi`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)} Mi`;
  }
  return formatNoCentsBRL(value);
}

function formatUpdatedLabel(date: Date): string {
  const now = new Date();
  const isToday =
    now.getFullYear() === date.getFullYear()
    && now.getMonth() === date.getMonth()
    && now.getDate() === date.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${isToday ? 'Atualizado hoje' : 'Atualizado'} às ${hh}:${mm}`;
}

export const RankingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    mode,
    setMode,
    loading,
    refreshing,
    items,
    error,
    load,
  } = useRanking();

  const [segment, setSegment] = useState<SegmentTabKey>('maiores');
  const [query, setQuery] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  const skipSegmentSyncRef = useRef(true);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await load(true);
    setLastUpdatedAt(new Date());
  }, [load]);

  const handleSegmentChange = useCallback((tab: SegmentTabKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSegment(tab);

    if (tab === 'maiores' && mode !== 'ceap') {
      setMode('ceap');
      return;
    }

    if (tab === 'economicos' && mode !== 'cecap') {
      setMode('cecap');
    }
  }, [mode, setMode]);

  useEffect(() => {
    if (segment === 'partidos') {
      return;
    }
    if (skipSegmentSyncRef.current) {
      skipSegmentSyncRef.current = false;
      return;
    }

    void (async () => {
      await load();
      setLastUpdatedAt(new Date());
    })();
  }, [load, mode, segment]);

  const onSegmentPress = useCallback((tab: SegmentTabKey) => {
    handleSegmentChange(tab);
  }, [handleSegmentChange]);

  const rows = useMemo<RankingRow[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (segment === 'partidos') {
      const partyMap = new Map<string, { amount: number; count: number }>();
      items.forEach((item) => {
        const key = String((item as any).partido ?? (item as any).siglaPartido ?? '--').toUpperCase();
        const current = partyMap.get(key) ?? { amount: 0, count: 0 };
        partyMap.set(key, {
          amount: current.amount + Number(item.total || 0),
          count: current.count + 1,
        });
      });

      const aggregated = Array.from(partyMap.entries()).map(([partido, payload]) => ({
        key: `party-${partido}`,
        name: partido,
        subtitle: `${payload.count} parlamentares`,
        amount: payload.amount,
        progress: Math.max(0, Math.min(payload.amount / RANKING_LIMIT, 1)),
      }));

      const sortedParty = aggregated.sort((a, b) => b.amount - a.amount);
      return sortedParty.filter((row) => {
        if (!normalizedQuery) {
          return true;
        }
        return row.name.toLowerCase().includes(normalizedQuery);
      });
    }

    const mapped = items.map((item) => ({
      party: String((item as any).partido ?? (item as any).siglaPartido ?? '').toUpperCase(),
      uf: String((item as any).uf ?? (item as any).siglaUf ?? '').toUpperCase(),
      amount: Number(item.total || 0),
      imageUri: toAbsoluteUrl(item.urlFoto) ?? item.urlFoto ?? undefined,
      key: `${item.deputadoId ?? item.deputyId ?? item.nome}-${(item as any).partido ?? (item as any).siglaPartido ?? ''}-${(item as any).uf ?? (item as any).siglaUf ?? ''}`,
      name: item.nome,
    })).map((item) => ({
      key: item.key,
      name: item.name,
      subtitle: item.party
        ? (item.uf ? `${item.party}  ${item.uf}` : item.party)
        : (item.uf || '--'),
      amount: item.amount,
      imageUri: item.imageUri,
      progress: Math.max(0, Math.min(item.amount / RANKING_LIMIT, 1)),
    }));

    const filtered = mapped.filter((row) => {
      if (!normalizedQuery) {
        return true;
      }
      return row.name.toLowerCase().includes(normalizedQuery) || row.subtitle.toLowerCase().includes(normalizedQuery);
    });

    const sorted = [...filtered];
    if (segment === 'economicos') {
      sorted.sort((a, b) => a.amount - b.amount);
    } else {
      sorted.sort((a, b) => b.amount - a.amount);
    }
    return sorted;
  }, [items, query, segment]);

  const totalMonitored = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.total || 0), 0);
  }, [items]);

  const updatedLabel = useMemo(() => formatUpdatedLabel(lastUpdatedAt), [lastUpdatedAt]);

  const keyExtractor = useCallback((item: RankingRow) => item.key, []);

  const renderItem = useCallback(({ item, index }: { item: RankingRow; index: number }) => {
    return (
      <RankingCard
        rank={index + 1}
        name={item.name}
        subtitle={item.subtitle}
        amountLabel={formatNoCentsBRL(item.amount)}
        progress={item.progress}
        limitLabel={formatNoCentsBRL(RANKING_LIMIT)}
        imageUri={item.imageUri}
      />
    );
  }, []);

  const tabBarBottomInset = Math.max(TAB_BAR_MIN_BOTTOM_GAP, insets.bottom);
  const tabBarStackHeight = TAB_BAR_BASE_HEIGHT + tabBarBottomInset;
  const footerBottomOffset = tabBarStackHeight;
  const listBottomPadding = SUMMARY_HEIGHT + SUMMARY_MARGIN + footerBottomOffset + 16;

  return (
    <ScreenBackground includeBottomInset={false}>
      <FlatList
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, { paddingBottom: listBottomPadding }]}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={9}
        updateCellsBatchingPeriod={40}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={designSystem.colors.green} />}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <RankingHeader updatedLabel={updatedLabel} />
            <SegmentTabs selected={segment} onChange={onSegmentPress} />
            <SearchInput value={query} onChangeText={setQuery} />
            {error ? <Snackbar message={error} tone="error" /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState label="Carregando ranking..." />
          ) : (
            <EmptyState
              title="Sem dados"
              description="Nenhum registro encontrado para os filtros atuais."
              icon="chart-line-variant"
            />
          )
        }
      />

      <RankingFooterSummary
        totalLabel={formatMonitorValue(totalMonitored)}
        bottomOffset={footerBottomOffset}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: designSystem.spacing.sm,
  },
  headerWrap: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
