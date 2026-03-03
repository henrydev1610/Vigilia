import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DashboardCategory } from '../../types/dashboard';
import { fallbackFonts } from '../../theme';
import { ProgressBar } from './ProgressBar';

interface CategoryBarsCardProps {
  items: DashboardCategory[];
  onPressSeeAll?: () => void;
}

export const CategoryBarsCard: React.FC<CategoryBarsCardProps> = ({ items, onPressSeeAll }) => {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[dashboard] categoryBars.rendered.length', items.length);
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleWrap}>
          <Icon name="chart-bar" size={18} color="#22D663" />
          <Text style={[styles.sectionTitle, { fontFamily: fallbackFonts.headingBold }]}>Gastos por Categoria</Text>
          <Pressable onPress={onPressSeeAll} hitSlop={8}>
            <Text style={[styles.link, { fontFamily: fallbackFonts.bodyMedium }]}>Ver tudo</Text>
          </Pressable>
        </View>
      </View>

      <LinearGradient colors={['#142A20', '#101A17']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        {items.map((item) => (
          <View key={item.name} style={styles.row}>
            <View style={styles.labels}>
              <Text style={[styles.name, { fontFamily: fallbackFonts.bodyMedium }]}>{item.name}</Text>
              <Text style={[styles.value, { fontFamily: fallbackFonts.headingBold }]}>{item.valueLabel}</Text>
            </View>
            <ProgressBar progress={item.progress} />
          </View>
        ))}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
  },
  sectionHeader: {
    marginTop: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 15,
    flexDirection: 'row',
    gap: 8,
  },
  sectionTitle: {
    marginLeft: -100,
    color: '#EEF3EF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  link: {
    color: '#1DCE59',
    fontSize: 15,
    fontWeight: 'bold',
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
    marginBottom: 14,
  },
  labels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    color: '#B8C8BE',
    fontSize: 14,
  },
  value: {
    color: '#CBD6CF',
    fontSize: 14,
  },
});
