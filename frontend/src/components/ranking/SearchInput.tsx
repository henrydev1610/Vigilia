import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.inputWrap}>
      <Icon name="magnify" size={20} color="#708D7D" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar parlamentar ou estado..."
        placeholderTextColor="#708D7D"
        style={styles.input}
      />
    </View>
  );
};

export const SearchInput = memo(SearchInputComponent);

const styles = StyleSheet.create({
  inputWrap: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#173729',
    borderWidth: 1,
    borderColor: 'rgba(143, 233, 168, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: '#DFF0E6',
    fontSize: 16,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
