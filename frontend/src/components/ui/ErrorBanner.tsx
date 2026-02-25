import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';
import { Button } from './Button';

interface ErrorBannerProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Falha ao carregar dados',
  message,
  actionLabel = 'Tentar novamente',
  onAction,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.danger }]}>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>{message}</Text>
      {onAction ? (
        <Button title={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  title: {
    fontSize: 14,
  },
  message: {
    fontSize: 12,
  },
});

