import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface SectionHeaderProps {
  icon?: React.ComponentProps<typeof Icon>['name'];
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, actionLabel, onAction }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon ? <Icon name={icon} size={20} color={colors.greenBright} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  action: {
    color: colors.greenBright,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});
