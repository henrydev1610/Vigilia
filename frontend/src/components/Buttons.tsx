import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';

type IconName = React.ComponentProps<typeof Icon>['name'];

interface BaseButtonProps {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
}

export const PrimaryButton: React.FC<BaseButtonProps> = ({
  title,
  onPress,
  icon,
  disabled,
  loading,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primaryContainer, (disabled || loading) ? styles.disabled : undefined]}
    >
      <View style={styles.inner}>
        {loading ? <ActivityIndicator color={colors.black} /> : null}
        {!loading && icon ? <Icon name={icon} size={18} color={colors.black} /> : null}
        <Text style={styles.primaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const SecondaryButton: React.FC<BaseButtonProps> = ({ title, onPress, icon, disabled }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.secondaryContainer, disabled ? styles.disabled : undefined]}
    >
      <View style={styles.inner}>
        {icon ? <Icon name={icon} size={18} color={colors.alertRed} /> : null}
        <Text style={styles.secondaryText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryContainer: {
    alignItems: 'center',
    backgroundColor: colors.greenBright,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  secondaryContainer: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderColor: `${colors.alertRed}44`,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  inner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.black,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  secondaryText: {
    color: colors.alertRed,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});
