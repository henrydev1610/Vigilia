import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({ value, onChangeText }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.inputWrap, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}> 
      <Icon name="magnify" size={20} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar parlamentar ou estado..."
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text }]}
      />
    </View>
  );
};

export const SearchInput = memo(SearchInputComponent);

const styles = StyleSheet.create({
  inputWrap: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
