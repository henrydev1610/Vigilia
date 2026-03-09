import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface ExpenseCardProps {
  dateLabel: string;
  title: string;
  supplierLabel: string;
  valueLabel: string;
  invoiceLabel: string;
  onPress: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  dateLabel,
  title,
  supplierLabel,
  valueLabel,
  invoiceLabel,
  onPress,
}) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.shadow.card.shadowColor,
        },
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{dateLabel}</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{valueLabel}</Text>
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.bottomRow}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.supplier, { color: theme.colors.textSecondary }]}> 
          {supplierLabel}
        </Text>
        <Text style={[styles.invoice, { color: theme.colors.textMuted }]}>{invoiceLabel}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginTop: 8,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  supplier: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 10,
  },
  invoice: {
    fontSize: 12,
    fontWeight: '700',
  },
});
