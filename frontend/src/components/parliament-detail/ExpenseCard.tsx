import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.value}>{valueLabel}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.bottomRow}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.supplier}>
          {supplierLabel}
        </Text>
        <Text style={styles.invoice}>{invoiceLabel}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D2C1C',
    borderColor: 'rgba(30, 171, 95, 0.22)',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
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
    color: '#81A794',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    color: '#E8F7EE',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  title: {
    color: '#EEF8F1',
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
    color: '#9AB8A9',
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 10,
  },
  invoice: {
    color: '#638877',
    fontSize: 12,
    fontWeight: '700',
  },
});
