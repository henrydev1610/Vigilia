import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DashboardCategory } from '../../types/dashboard';
import { fallbackFonts, useAppTheme } from '../../theme';
import { ProgressBar } from './ProgressBar';

interface CategoryBarsCardProps {
  items: DashboardCategory[];
  onPressSeeAll?: () => void;
}

export const CategoryBarsCard: React.FC<CategoryBarsCardProps> = ({ items, onPressSeeAll }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleWrap}>
          <Icon name="chart-bar" size={18} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Gastos por Categoria</Text>
          <Pressable onPress={onPressSeeAll} hitSlop={8}>
            <Text style={[styles.link, { color: theme.colors.primary, fontFamily: fallbackFonts.bodyMedium }]}>Ver tudo</Text>
          </Pressable>
        </View>
      </View>

      <LinearGradient colors={theme.gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderColor: theme.colors.border }]}> 
        {items.map((item) => (
          <View key={item.name} style={styles.row}>
            <View style={styles.labels}>
              <Text style={[styles.name, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>{item.name}</Text>
              <Text style={[styles.value, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{item.valueLabel}</Text>
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 15,
    fontWeight: 'bold',
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
    marginBottom: 14,
  },
  labels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
  },
});
