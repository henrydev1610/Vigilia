import React from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useDesignSystem, useAppTheme } from '../../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onPressFilters?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChangeText, onPressFilters }) => {
  const designSystem = useDesignSystem();
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.inputWrap, {
        backgroundColor: designSystem.colors.inputBg,
        borderColor: designSystem.colors.inputBorder,
        ...designSystem.shadow.card,
      }]}
      >
        <Icon name="magnify" size={20} color={designSystem.colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar por nome ou partido..."
          placeholderTextColor={designSystem.colors.textMuted}
          style={[styles.input, { color: designSystem.colors.textPrimary }]}
        />
      </View>
      <Pressable style={[styles.filterButton, { backgroundColor: designSystem.colors.green }]} onPress={onPressFilters} accessibilityLabel="Abrir filtros">
        <Icon name="tune-variant" size={20} color={theme.colors.textInverse} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    includeFontPadding: false,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
