import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/format';
import { ExpenseCategory } from '../data/mockData';

interface ExpenseItemProps {
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  invoiceNumber?: string;
  onPress?: () => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  date,
  description,
  category,
  amount,
  invoiceNumber,
  onPress,
}) => {
  const categoryChipStyle =
    category === 'ATIVIDADE PARLAMENTAR'
      ? styles.categoryAtividadeBg
      : category === 'LOCOMOÇÃO'
      ? styles.categoryLocomocaoBg
      : category === 'COMUNICAÇÃO'
      ? styles.categoryComunicacaoBg
      : styles.categoryInfraestruturaBg;
  const categoryTextStyle =
    category === 'ATIVIDADE PARLAMENTAR'
      ? styles.categoryAtividadeText
      : category === 'LOCOMOÇÃO'
      ? styles.categoryLocomocaoText
      : category === 'COMUNICAÇÃO'
      ? styles.categoryComunicacaoText
      : styles.categoryInfraestruturaText;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.bottomRow}>
        <View style={[styles.chip, categoryChipStyle]}>
          <Text style={[styles.chipText, categoryTextStyle]}>{category}</Text>
        </View>
        {invoiceNumber ? <Text style={styles.invoice}>{invoiceNumber}</Text> : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
    padding: spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  date: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  categoryAtividadeBg: {
    backgroundColor: `${colors.greenMid}33`,
  },
  categoryAtividadeText: {
    color: colors.greenMid,
  },
  categoryLocomocaoBg: {
    backgroundColor: `${colors.locBlue}33`,
  },
  categoryLocomocaoText: {
    color: colors.locBlue,
  },
  categoryComunicacaoBg: {
    backgroundColor: `${colors.comPurple}33`,
  },
  categoryComunicacaoText: {
    color: colors.comPurple,
  },
  categoryInfraestruturaBg: {
    backgroundColor: `${colors.alertOrange}33`,
  },
  categoryInfraestruturaText: {
    color: colors.alertOrange,
  },
  invoice: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
});
