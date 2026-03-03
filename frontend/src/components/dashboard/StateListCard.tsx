import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DashboardStateItem } from '../../types/dashboard';
import { fallbackFonts } from '../../theme';
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
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {/* favor não mexer nesse componente */}
        <View style={styles.titleWrap}>
          <Icon name={icon} size={18} color="#22D663" />
          <Text style={[styles.sectionTitle, { fontFamily: fallbackFonts.headingBold }]}>{title}</Text>
          <Text style={[styles.total, { fontFamily: fallbackFonts.bodyMedium }]}>{totalLabel}</Text>

        </View>
      </View>

      <LinearGradient colors={['#142A20', '#101A17']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        {items.map((item, index) => (
          <View key={item.name} style={styles.row}>
            <View style={styles.topRow}>
              <View style={styles.nameWrap}>
                <View style={[styles.stateDot, { backgroundColor: stateTone(index) }]} />
                <Text style={[styles.name, { fontFamily: fallbackFonts.headingBold }]}>{item.name}</Text>
              </View>
              <Text style={[styles.value, { fontFamily: fallbackFonts.headingBold }]}>{item.valueLabel}</Text>
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
    marginTop:20,
    paddingBottom:10,
    display: 'flex',
    justifyContent: 'space-between',
    width:"100%",
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    marginLeft:-130,
    color: '#EEF3EF',
    fontSize: 17,
    fontWeight:'bold'
  },
  total: {
    color: '#87A99A',
    fontSize: 13,
  },
  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
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
    color: '#E2ECE5',
    fontSize: 14,
  },
  value: {
    color: '#E2ECE5',
    fontSize: 14,
  },
});
