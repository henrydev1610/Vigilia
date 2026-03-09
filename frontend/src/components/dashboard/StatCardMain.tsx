import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts, useAppTheme } from '../../theme';

interface StatCardMainProps {
  monthTotal: number;
  monthDeltaPct: number;
}

function formatMonthTotal(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(value);
}

export const StatCardMain: React.FC<StatCardMainProps> = ({ monthTotal, monthDeltaPct }) => {
  const theme = useAppTheme();
  const isNegative = monthDeltaPct < 0;
  const deltaLabel = `${isNegative ? '' : '+'}${monthDeltaPct.toFixed(1)}%`;

  return (
    <LinearGradient colors={theme.gradients.card.length === 2 ? [theme.gradients.card[0], theme.gradients.card[1], theme.colors.surfaceMuted] : theme.gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.9 }} style={[styles.card, { borderColor: theme.colors.border }]}> 
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>Total Gasto (Mes)</Text>

        <View style={styles.amountRow}>
          <Text style={[styles.currency, { color: theme.colors.primary, fontFamily: fallbackFonts.headingBold }]}>R$</Text>
          <Text style={[styles.amount, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{formatMonthTotal(monthTotal)}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: isNegative ? theme.colors.dangerSoft : theme.colors.successSoft }]}>
            <Icon name={isNegative ? 'trending-down' : 'trending-up'} size={12} color={isNegative ? theme.colors.danger : theme.colors.success} />
            <Text style={[styles.badgeText, { color: isNegative ? theme.colors.danger : theme.colors.success, fontFamily: fallbackFonts.bodyMedium }]}>{deltaLabel}</Text>
          </View>
          <Text style={[styles.badgeLabel, { color: theme.colors.textMuted, fontFamily: fallbackFonts.body }]}>vs. mes anterior</Text>
        </View>
      </View>

      <View style={styles.decorWrap}>
        <Icon name="cash-multiple" size={50} color={theme.colors.surfaceStrong} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 124,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  amountRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  currency: {
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 38,
  },
  amount: {
    fontSize: 41,
    fontWeight: 'bold',
    lineHeight: 54,
    letterSpacing: -1,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 16,
  },
  badgeLabel: {
    fontSize: 15,
  },
  decorWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginTop: -90,
  },
});
