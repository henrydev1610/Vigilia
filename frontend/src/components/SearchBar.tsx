import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar',
  value,
  onChangeText,
  onFilterPress,
  showFilter = false,
}) => {


  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </View>
      {showFilter ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onFilterPress} style={styles.filterButton}>
          <Icon name="tune-variant" size={20} color={colors.white} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderColor: colors.borderCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.fontSize.base,
    height: 44,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.greenBright,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
