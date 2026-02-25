import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts, useAppTheme } from '../../theme';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, placeholder, onChange }) => {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);
  const optionsWithStableKey = useMemo(() => {
    const occurrence = new Map<string, number>();
    return options.map((option) => {
      const normalized = option.value.trim().toUpperCase() || '__EMPTY__';
      const count = (occurrence.get(normalized) ?? 0) + 1;
      occurrence.set(normalized, count);
      return {
        ...option,
        stableKey: `${normalized}-${count}`,
      };
    });
  }, [options]);

  const selectedLabel = useMemo(() => {
    return optionsWithStableKey.find((option) => option.value === value)?.label ?? placeholder ?? 'Selecionar';
  }, [optionsWithStableKey, placeholder, value]);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.84}
        style={[styles.trigger, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.value, { color: theme.colors.text, fontFamily: fallbackFonts.body }]}>{selectedLabel}</Text>
        <Icon name="chevron-down" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.colors.overlay }]} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
            <ScrollView>
              {optionsWithStableKey.map((option) => {
                const selected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.stableKey}
                    style={styles.option}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selected ? theme.colors.primary : theme.colors.text,
                          fontFamily: selected ? fallbackFonts.bodyMedium : fallbackFonts.body,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selected ? <Icon name="check" size={16} color={theme.colors.primary} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  trigger: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  value: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  menu: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: '60%',
    padding: 8,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 14,
  },
});
