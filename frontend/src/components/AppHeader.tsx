import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { AppLogo } from './branding/AppLogo';
import { HeaderProfileButton } from './header';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBellPress?: () => void;
  onProfilePress?: () => void;
  showLogo?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBellPress,
  onProfilePress,
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showLogo ? (
          <View style={styles.logoBox}>
            <AppLogo variant="header" size={30} />
          </View>
        ) : null}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text> : null}
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity activeOpacity={0.8} onPress={onBellPress} style={styles.iconButton}>
          <Icon name="bell-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <HeaderProfileButton
          iconSize={24}
          iconColor={colors.textSecondary}
          onPress={onProfilePress}
          containerStyle={styles.iconButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    color: colors.greenText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
  },
  right: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
  },
});
