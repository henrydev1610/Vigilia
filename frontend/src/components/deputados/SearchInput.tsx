import React from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { designSystem } from '../../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onPressFilters?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChangeText, onPressFilters }) => {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <Icon name="magnify" size={20} color={designSystem.colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar por nome ou partido..."
          placeholderTextColor={designSystem.colors.textMuted}
          style={styles.input}
        />
      </View>
      <Pressable style={styles.filterButton} onPress={onPressFilters} accessibilityLabel="Abrir filtros">
        <Icon name="tune-variant" size={20} color={designSystem.colors.bg} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: designSystem.spacing.xs,
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    minHeight: 48,
    borderRadius: designSystem.radius.input,
    backgroundColor: designSystem.colors.inputBg,
    borderWidth: 1,
    borderColor: designSystem.colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing.sm,
    ...designSystem.shadow.card,
  },
  input: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: designSystem.typography.sizes.body,
    lineHeight: designSystem.typography.lineHeights.body,
    includeFontPadding: false,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designSystem.colors.green,
  },
});
