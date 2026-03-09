import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme';
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
  const theme = useAppTheme();
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Resumo Mensal</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Gastos diarios do mes selecionado</Text>
        </View>

        <View style={styles.totalWrap}>
          <Text style={[styles.totalLabel, { color: theme.colors.textMuted }]}>{totalLabel}</Text>
          {loading ? (
            <Skeleton height={34} width={140} style={styles.totalSkeleton} />
          ) : (
            <Text
              adjustsFontSizeToFit
              ellipsizeMode="tail"
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[styles.totalValue, { color: theme.colors.primary, fontSize: valueFontSize }]}
            >
              {totalValue}
            </Text>
          )}
        </View>
      </View>

      <Pressable onPress={onOpenPeriodPicker} style={[styles.periodButton, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}> 
        <Text numberOfLines={1} style={[styles.periodButtonText, { color: theme.colors.textSecondary }]}> 
          Selecionar mes/ano: {periodLabel}
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
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
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
