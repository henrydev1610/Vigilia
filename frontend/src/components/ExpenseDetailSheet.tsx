import React from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/format';
import { PrimaryButton, SecondaryButton } from './Buttons';

interface ExpenseDetailSheetProps {
  supplierName: string;
  cnpj: string;
  verified?: boolean;
  totalAmount: number;
  paymentMethod: string;
  issueDate: string;
  category: string;
  onShare?: () => void;
  onReport?: () => void;
  onClose?: () => void;
}

export const ExpenseDetailSheet: React.FC<ExpenseDetailSheetProps> = ({
  supplierName,
  cnpj,
  verified,
  totalAmount,
  paymentMethod,
  issueDate,
  category,
  onShare,
  onReport,
  onClose,
}) => {
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    await Share.share({
      message: `Fornecedor: ${supplierName}\nValor: ${formatCurrency(totalAmount)}\nCategoria: ${category}`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.topButton}>
          <Icon name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhe do Gasto</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={handleShare} style={styles.topButton}>
          <Icon name="share-variant-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.supplierIcon}>
        <Icon name="storefront-outline" size={30} color={colors.greenBright} />
        {verified ? (
          <View style={styles.verifiedBadge}>
            <Icon name="check-circle" size={16} color={colors.greenBright} />
          </View>
        ) : null}
      </View>

      <Text style={styles.supplierName}>{supplierName}</Text>
      <Text style={styles.cnpj}>{cnpj}</Text>

      {verified ? (
        <View style={styles.verifiedPill}>
          <Text style={styles.verifiedText}>FORNECEDOR VERIFICADO</Text>
        </View>
      ) : null}

      <Text style={styles.amountLabel}>VALOR TOTAL</Text>
      <Text style={styles.amountValue}>{formatCurrency(totalAmount)}</Text>
      <Text style={styles.paymentMethod}>{paymentMethod}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>DATA DE EMISSAO</Text>
          <Text style={styles.metaValue}>{issueDate}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>CATEGORIA</Text>
          <Text style={styles.metaValue}>{category}</Text>
        </View>
      </View>

      <View style={styles.buttonColumn}>
        <PrimaryButton title="Compartilhar Gasto" icon="share-variant" onPress={handleShare} />
        <SecondaryButton
          title="Denunciar Gasto Suspeito"
          icon="alert-circle-outline"
          onPress={onReport}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.sheetHandle,
    borderRadius: radii.full,
    height: 4,
    marginBottom: spacing.base,
    width: 40,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topButton: {
    padding: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  supplierIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radii.full,
    height: 72,
    justifyContent: 'center',
    marginTop: spacing.base,
    position: 'relative',
    width: 72,
  },
  verifiedBadge: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radii.full,
    bottom: 2,
    position: 'absolute',
    right: 2,
  },
  supplierName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.black,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  cnpj: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  verifiedPill: {
    alignSelf: 'center',
    backgroundColor: colors.greenDark,
    borderRadius: radii.full,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifiedText: {
    color: colors.greenBright,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  amountValue: {
    color: colors.greenBright,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  paymentMethod: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  metaCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    flex: 1,
    padding: spacing.base,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wider,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
  },
  buttonColumn: {
    gap: spacing.sm,
    marginTop: spacing.base,
  },
});
