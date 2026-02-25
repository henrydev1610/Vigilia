import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

interface LoadingStateProps {
  label?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Carregando...' }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { paddingVertical: theme.spacing.xl }]}> 
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.size.body,
            lineHeight: theme.typography.lineHeight.body,
            fontFamily: fallbackFonts.body,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {},
});

