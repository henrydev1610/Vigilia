import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DashboardStateItem } from '../../types/dashboard';
import { fallbackFonts, useAppTheme } from '../../theme';
import { ProgressBar } from './ProgressBar';

interface StateListCardProps {
  totalLabel: string;
  items: DashboardStateItem[];
  title?: string;
  icon?: React.ComponentProps<typeof Icon>['name'];
}

function stateTone(index: number): string {
  const tones = ['#2D5A83', '#2A6B61', '#6B5A2E', '#5A3566', '#365D7D'];
  return tones[index % tones.length];
}

export const StateListCard: React.FC<StateListCardProps> = ({
  totalLabel,
  items,
  title = 'Gastos por Estado',
  icon = 'map',
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleWrap}>
          <Icon name={icon} size={18} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{title}</Text>
          <Text style={[styles.total, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>{totalLabel}</Text>
        </View>
      </View>

      <LinearGradient colors={theme.gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderColor: theme.colors.border }]}> 
        {items.map((item, index) => (
          <View key={item.name} style={styles.row}>
            <View style={styles.topRow}>
              <View style={styles.nameWrap}>
                <View style={[styles.stateDot, { backgroundColor: stateTone(index) }]} />
                <Text style={[styles.name, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{item.name}</Text>
              </View>
              <Text style={[styles.value, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{item.valueLabel}</Text>
            </View>
            {typeof item.progress === 'number' ? <ProgressBar progress={item.progress} /> : null}
          </View>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
    marginTop: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleWrap: {
    marginTop: 20,
    paddingBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    marginLeft: -130,
    fontSize: 17,
    fontWeight: 'bold',
  },
  total: {
    fontSize: 13,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  row: {
    marginBottom: 12,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stateDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  name: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
  },
});
