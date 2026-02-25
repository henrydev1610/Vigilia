import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { colors, radii, spacing, typography } from '../theme';
import { formatCurrency } from '../utils/format';

interface RankingCardProps {
  position: number;
  name: string;
  party: string;
  state: string;
  amount: number;
  quotaLimit: number;
  avatarUrl?: string;
  highlighted?: boolean;
  onPress?: () => void;
}

const medalStyle = (position: number): object => {
  if (position === 1) {
    return styles.positionGold;
  }
  if (position === 2) {
    return styles.positionSilver;
  }
  if (position === 3) {
    return styles.positionBronze;
  }
  return styles.positionDefault;
};

export const RankingCard: React.FC<RankingCardProps> = ({
  position,
  name,
  party,
  state,
  amount,
  quotaLimit,
  avatarUrl,
  highlighted,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.container, highlighted ? styles.highlighted : undefined]}>
      <View style={styles.row}>
        <View style={[styles.positionBadge, medalStyle(position)]}>
          <Text style={styles.positionText}>{`${position}º`}</Text>
        </View>
        {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={styles.avatar} />}
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{`${party} - ${state}`}</Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
          <Progress.Bar
            progress={Math.max(0, Math.min(1, amount / quotaLimit))}
            width={null}
            color={colors.greenBright}
            unfilledColor={colors.progressBg}
            borderWidth={0}
            height={5}
            borderRadius={radii.full}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.base,
  },
  highlighted: {
    borderColor: colors.greenBright,
    borderWidth: 1.5,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  positionBadge: {
    alignItems: 'center',
    borderRadius: radii.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  positionGold: {
    backgroundColor: colors.medalGold,
  },
  positionSilver: {
    backgroundColor: colors.medalSilver,
  },
  positionBronze: {
    backgroundColor: colors.alertOrange,
  },
  positionDefault: {
    backgroundColor: colors.bgCardLight,
  },
  positionText: {
    color: colors.black,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.black,
  },
  avatar: {
    backgroundColor: colors.bgCardLight,
    borderRadius: radii.sm,
    height: 48,
    width: 48,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.greenText,
    fontSize: typography.fontSize.sm,
  },
  amount: {
    color: colors.greenBright,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
