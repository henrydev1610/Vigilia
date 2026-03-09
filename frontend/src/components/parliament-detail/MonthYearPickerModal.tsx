import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface MonthYearPickerModalProps {
  visible: boolean;
  selectedMonth: number;
  selectedYear: number;
  onClose: () => void;
  onConfirm: (next: { month: number; year: number }) => void;
}

const MONTH_OPTIONS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' },
];

export const MonthYearPickerModal: React.FC<MonthYearPickerModalProps> = ({
  visible,
  selectedMonth,
  selectedYear,
  onClose,
  onConfirm,
}) => {
  const theme = useAppTheme();
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, idx) => currentYear - idx);
  }, [currentYear]);

  const [month, setMonth] = useState(selectedMonth);
  const [year, setYear] = useState(selectedYear);

  React.useEffect(() => {
    if (!visible) return;
    setMonth(selectedMonth);
    setYear(selectedYear);
  }, [selectedMonth, selectedYear, visible]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}> 
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}> 
          <Text style={[styles.title, { color: theme.colors.text }]}>Selecionar mes/ano</Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Mes</Text>
          <ScrollView contentContainerStyle={styles.optionsRow} horizontal showsHorizontalScrollIndicator={false}>
            {MONTH_OPTIONS.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setMonth(item.value)}
                style={[
                  styles.option,
                  {
                    backgroundColor: month === item.value ? theme.colors.primary : theme.colors.surfaceAlt,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: month === item.value ? theme.colors.textInverse : theme.colors.textSecondary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Ano</Text>
          <View style={styles.optionsRowWrap}>
            {yearOptions.map((item) => (
              <Pressable
                key={item}
                onPress={() => setYear(item)}
                style={[
                  styles.option,
                  {
                    backgroundColor: year === item ? theme.colors.primary : theme.colors.surfaceAlt,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: year === item ? theme.colors.textInverse : theme.colors.textSecondary }]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={[styles.action, { backgroundColor: theme.colors.surfaceAlt }]}>
              <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm({ month, year })}
              style={[styles.action, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={[styles.confirmText, { color: theme.colors.textInverse }]}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 26,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    textTransform: 'uppercase',
  },
  optionsRow: {
    gap: 8,
    paddingVertical: 8,
  },
  optionsRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  option: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  action: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
