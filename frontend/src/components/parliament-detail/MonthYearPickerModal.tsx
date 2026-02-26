import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <Text style={styles.title}>Selecionar mês/ano</Text>

          <Text style={styles.label}>Mês</Text>
          <ScrollView contentContainerStyle={styles.optionsRow} horizontal showsHorizontalScrollIndicator={false}>
            {MONTH_OPTIONS.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setMonth(item.value)}
                style={[styles.option, month === item.value ? styles.optionActive : null]}
              >
                <Text style={[styles.optionText, month === item.value ? styles.optionTextActive : null]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Ano</Text>
          <View style={styles.optionsRowWrap}>
            {yearOptions.map((item) => (
              <Pressable
                key={item}
                onPress={() => setYear(item)}
                style={[styles.option, year === item ? styles.optionActive : null]}
              >
                <Text style={[styles.optionText, year === item ? styles.optionTextActive : null]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={[styles.action, styles.cancel]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm({ month, year })}
              style={[styles.action, styles.confirm]}
            >
              <Text style={styles.confirmText}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(2, 11, 7, 0.62)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#102A1C',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 26,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    color: '#E6F4EB',
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    color: '#7FA792',
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
    backgroundColor: '#133523',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionActive: {
    backgroundColor: '#1EE06C',
  },
  optionText: {
    color: '#B8D5C6',
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#072213',
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
  cancel: {
    backgroundColor: '#163426',
  },
  confirm: {
    backgroundColor: '#1EE06C',
  },
  cancelText: {
    color: '#D9EEE3',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    color: '#082314',
    fontSize: 14,
    fontWeight: '800',
  },
});
