import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';
import { AppText } from '../ui';

interface RankBadgeProps {
  rank: number;
}

const TOP_COLORS = ['#F2B81F', '#AAB5C6', '#CC7A2D'];

const RankBadgeComponent: React.FC<RankBadgeProps> = ({ rank }) => {
  const topIndex = rank - 1;
  const isTop = topIndex >= 0 && topIndex <= 2;
  const label = `${rank}º`;

  return (
    <View
      style={[
        styles.badge,
        isTop ? { backgroundColor: TOP_COLORS[topIndex] } : styles.badgeDefault,
      ]}
    >
      <AppText weight="bold" style={[styles.text, isTop ? styles.textTop : null]}>
        {label}
      </AppText>
    </View>
  );
};

export const RankBadge = memo(RankBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    minWidth: 34,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeDefault: {
    backgroundColor: '#344E43',
  },
  text: {
    fontSize: 13,
    lineHeight: 16,
    color: designSystem.colors.textPrimary,
    includeFontPadding: false,
  },
  textTop: {
    color: '#102416',
  },
});
