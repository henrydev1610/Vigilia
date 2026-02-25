import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { colors, radii, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/format';

interface PoliticianCardProps {
  name: string;
  party: string;
  state: string;
  quotaUsed: number;
  quotaLimit: number;
  quotaPercent: number;
  avatarUrl?: string;
  verified?: boolean;
  onPress?: () => void;
}

const quotaColor = (quotaPercent: number): string => {
  if (quotaPercent < 65) {
    return colors.greenBright;
  }
  if (quotaPercent <= 85) {
    return colors.alertYellow;
  }
  return colors.alertRed;
};

export const PoliticianCard: React.FC<PoliticianCardProps> = ({
  name,
  party,
  state,
  quotaUsed,
  quotaLimit,
  quotaPercent,
  avatarUrl,
  verified,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={styles.avatarFallback} />}
          {verified ? (
            <View style={styles.checkBadge}>
              <Icon name="check-circle" size={16} color={colors.greenBright} />
            </View>
          ) : null}
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{`${party} - ${state}`}</Text>
          <Progress.Bar
            progress={Math.max(0, Math.min(1, quotaPercent / 100))}
            width={null}
            color={quotaColor(quotaPercent)}
            unfilledColor={colors.progressBg}
            borderWidth={0}
            height={6}
            borderRadius={radii.full}
          />
          <View style={styles.footer}>
            <Text style={styles.footerText}>{`Gasto: ${formatCurrency(quotaUsed)}`}</Text>
            <Text style={styles.footerText}>{`Limite: ${formatCurrency(quotaLimit)}`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    padding: spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarWrapper: {
    height: 56,
    position: 'relative',
    width: 56,
  },
  avatar: {
    borderColor: colors.greenDark,
    borderRadius: radii.full,
    borderWidth: 2,
    height: 56,
    width: 56,
  },
  avatarFallback: {
    backgroundColor: colors.bgCardLight,
    borderColor: colors.greenDark,
    borderRadius: radii.full,
    borderWidth: 2,
    height: 56,
    width: 56,
  },
  checkBadge: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radii.full,
    bottom: -2,
    position: 'absolute',
    right: -2,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.greenText,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
});
