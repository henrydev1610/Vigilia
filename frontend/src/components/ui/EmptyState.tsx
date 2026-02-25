import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'shield-search-outline',
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { paddingVertical: theme.spacing.xxl }]}> 
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}> 
        <MaterialCommunityIcons name={icon as any} size={24} color={theme.colors.primary} />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: theme.typography.size.h3,
            lineHeight: theme.typography.lineHeight.h3,
            fontFamily: fallbackFonts.heading,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.description,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.size.body,
            lineHeight: theme.typography.lineHeight.body,
            fontFamily: fallbackFonts.body,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: 48,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});

