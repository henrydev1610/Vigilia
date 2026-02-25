import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  accessibilityLabel,
}) => {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const backgroundColorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceAlt,
    danger: theme.colors.danger,
    ghost: 'transparent',
  } as const;

  const textColorMap = {
    primary: '#04240F',
    secondary: theme.colors.text,
    danger: '#FFFFFF',
    ghost: theme.colors.textSecondary,
  } as const;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: backgroundColorMap[variant],
          borderColor: variant === 'ghost' ? theme.colors.border : 'transparent',
          borderRadius: theme.radius.md,
          minHeight: 48,
          opacity: isDisabled ? theme.opacity.disabled : 1,
        },
        variant === 'ghost' ? styles.ghost : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#052915' : textColorMap[variant]} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColorMap[variant],
              fontSize: theme.typography.size.body,
              lineHeight: theme.typography.lineHeight.body,
              fontFamily: fallbackFonts.bodyMedium,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '700',
  },
});

