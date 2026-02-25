import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fallbackFonts, useAppTheme } from '../../theme';

interface SnackbarProps {
  message: string;
  tone?: 'success' | 'error' | 'warning';
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, tone = 'success' }) => {
  const theme = useAppTheme();
  const map = {
    success: { icon: 'check-circle-outline', color: theme.colors.success },
    error: { icon: 'alert-circle-outline', color: theme.colors.danger },
    warning: { icon: 'alert-outline', color: theme.colors.warning },
  } as const;

  const current = map[tone];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}> 
      <MaterialCommunityIcons name={current.icon} size={18} color={current.color} />
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.size.caption,
          lineHeight: theme.typography.lineHeight.caption,
          fontFamily: fallbackFonts.bodyMedium,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

