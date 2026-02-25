import React from 'react';
import { Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { toAbsoluteUrl } from '../../services/api';
import { formatCurrencyBRL, formatDateBR } from '../../utils/format';
import { fallbackFonts, useAppTheme } from '../../theme';
import { Badge, Button, Card } from '../ui';

interface ExpenseDetailModalProps {
  visible: boolean;
  onClose: () => void;
  expense: {
    tipo: string;
    fornecedor: string;
    valor: number;
    data: string;
    cnpjCpf: string | null;
    pdfUrl: string | null;
  } | null;
  onOpenPdf: (url: string | null) => Promise<void>;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  visible,
  onClose,
  expense,
  onOpenPdf,
}) => {
  const theme = useAppTheme();

  async function handleShare() {
    if (!expense?.pdfUrl) {
      await Share.share({ message: `${expense?.fornecedor ?? 'Despesa'} - ${formatCurrencyBRL(expense?.valor ?? 0)}` });
      return;
    }
    const absoluteUrl = toAbsoluteUrl(expense.pdfUrl) ?? expense.pdfUrl;
    await Share.share({ message: absoluteUrl, url: absoluteUrl });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Detalhe do Gasto</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Card>
            <View style={styles.row}>
              <View style={[styles.iconBadge, { backgroundColor: theme.colors.primarySoft }]}> 
                <Icon name="receipt-text-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.fornecedor, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{expense?.fornecedor || 'Fornecedor não informado'}</Text>
                <Badge label={expense?.cnpjCpf ? 'Fornecedor identificado' : 'Sem verificacao'} tone={expense?.cnpjCpf ? 'success' : 'default'} />
              </View>
            </View>

            <Text style={[styles.tipo, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>{expense?.tipo ?? 'Despesa'}</Text>
            <Text style={[styles.valor, { color: theme.colors.primary, fontFamily: fallbackFonts.headingBold }]}>{formatCurrencyBRL(expense?.valor ?? 0)}</Text>

            <View style={styles.metaCards}>
              <View style={[styles.metaCard, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted, fontFamily: fallbackFonts.body }]}>Data</Text>
                <Text style={[styles.metaValue, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{formatDateBR(expense?.data)}</Text>
              </View>
              <View style={[styles.metaCard, { backgroundColor: theme.colors.surfaceAlt }]}>
                <Text style={[styles.metaLabel, { color: theme.colors.textMuted, fontFamily: fallbackFonts.body }]}>Categoria</Text>
                <Text style={[styles.metaValue, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{expense?.tipo ?? 'Despesa'}</Text>
              </View>
            </View>

            <View style={styles.footerActions}>
              <Button title="Compartilhar" variant="ghost" onPress={handleShare} style={styles.action} />
              <Button title="Ver PDF/Nota" variant="secondary" onPress={() => onOpenPdf(expense?.pdfUrl ?? null)} style={styles.action} />
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  flex: {
    flex: 1,
    gap: 6,
  },
  fornecedor: {
    fontSize: 16,
  },
  tipo: {
    marginTop: 12,
  },
  valor: {
    fontSize: 30,
    marginTop: 6,
  },
  metaCards: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  metaCard: {
    borderRadius: 12,
    flex: 1,
    padding: 10,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaValue: {
    fontSize: 13,
    marginTop: 4,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  action: {
    flex: 1,
  },
});
