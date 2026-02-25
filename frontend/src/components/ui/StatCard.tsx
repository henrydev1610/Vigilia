import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { fallbackFonts, useAppTheme } from '../../theme';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle }) => {
  const theme = useAppTheme();
  return (
    <Card>
      <View style={styles.header}>
        <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{value}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontFamily: fallbackFonts.body }]}>{subtitle}</Text> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    fontSize: 12,
  },
  value: {
    fontSize: 22,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 6,
  },
});

