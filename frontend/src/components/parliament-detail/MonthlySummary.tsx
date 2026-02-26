import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

interface MonthlySummaryProps {
  totalLabel: string;
  totalValue: string;
  periodLabel: string;
  loading?: boolean;
  onOpenPeriodPicker: () => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  totalLabel,
  totalValue,
  periodLabel,
  loading = false,
  onOpenPeriodPicker,
}) => {
  const valueFontSize = useMemo(() => {
    const size = totalValue.length;
    if (size >= 16) return 24;
    if (size >= 14) return 27;
    if (size >= 12) return 30;
    return 34;
  }, [totalValue.length]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.leftCol}>
          <Text style={styles.title}>Resumo Mensal</Text>
          <Text style={styles.subtitle}>Gastos diários do mês selecionado</Text>
        </View>

        <View style={styles.totalWrap}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          {loading ? (
            <Skeleton height={34} width={140} style={styles.totalSkeleton} />
          ) : (
            <Text
              adjustsFontSizeToFit
              ellipsizeMode="tail"
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[styles.totalValue, { fontSize: valueFontSize }]}
            >
              {totalValue}
            </Text>
          )}
        </View>
      </View>

      <Pressable onPress={onOpenPeriodPicker} style={styles.periodButton}>
        <Text numberOfLines={1} style={styles.periodButtonText}>
          Selecionar mês/ano: {periodLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  title: {
    color: '#E6F4EB',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#7AA790',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  totalWrap: {
    alignItems: 'flex-end',
    flexShrink: 1,
    maxWidth: '48%',
    minWidth: 126,
  },
  totalLabel: {
    color: '#6E9783',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    color: '#17D968',
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 2,
    textAlign: 'right',
  },
  totalSkeleton: {
    marginTop: 6,
  },
  periodButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#103424',
    borderColor: 'rgba(34, 197, 94, 0.28)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodButtonText: {
    color: '#B8D5C6',
    fontSize: 12,
    fontWeight: '700',
  },
});
