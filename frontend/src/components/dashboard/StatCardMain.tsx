import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts } from '../../theme';

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
  const isNegative = monthDeltaPct < 0;
  const deltaLabel = `${isNegative ? '' : '+'}${monthDeltaPct.toFixed(1)}%`;

  return (
    <LinearGradient colors={['#142D22', '#112920', '#111D18']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.9 }} style={styles.card}>
      <View style={styles.content}>
        <Text style={[styles.title, { fontFamily: fallbackFonts.bodyMedium }]}>Total Gasto (Mês)</Text>

        <View style={styles.amountRow}>
          <Text style={[styles.currency, { fontFamily: fallbackFonts.headingBold }]}>R$</Text>
          <Text style={[styles.amount, { fontFamily: fallbackFonts.headingBold }]}>{formatMonthTotal(monthTotal)}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, isNegative ? styles.badgeNegative : null]}>
            <Icon name={isNegative ? 'trending-down' : 'trending-up'} size={12} color={isNegative ? '#FF6F69' : '#18D85E'} />
            <Text style={[styles.badgeText, isNegative ? styles.badgeTextNegative : null, { fontFamily: fallbackFonts.bodyMedium }]}>{deltaLabel}</Text>
          </View>
          <Text style={[styles.badgeLabel, { fontFamily: fallbackFonts.body }]}>vs. mês anterior</Text>
        </View>
      </View>

      <View style={styles.decorWrap}>
        <Icon name="cash-multiple" size={50} color="#2F4D45" />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 124,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#9BB0A6',
    fontSize: 17,
    fontWeight:'700',
    marginBottom: 8,
  },
  amountRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  currency: {
    color: '#1BDC5D',
    fontSize: 21,
    fontWeight:900,
    lineHeight: 38,
  },
  amount: {
    color: '#EAF2EE',
    fontSize: 41,
    fontWeight:"bold",
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
    backgroundColor: '#113223',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#1BDC5D',
    fontSize: 16,
  },
  badgeTextNegative: {
    color: '#FF6F69',
  },
  badgeNegative: {
    backgroundColor: '#3A1E1E',
  },
  badgeLabel: {
    color: '#6A7D92',
    fontSize: 15,
  },
  decorWrap: {

    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginTop:-90
  },
});
