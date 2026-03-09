import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface RankBadgeProps {
  rank: number;
}

const TOP_COLORS = ['#F2B81F', '#AAB5C6', '#CC7A2D'];

const RankBadgeComponent: React.FC<RankBadgeProps> = ({ rank }) => {
  const theme = useAppTheme();
  const topIndex = rank - 1;
  const isTop = topIndex >= 0 && topIndex <= 2;
  const label = `${rank}o`;

  return (
    <View
      style={[
        styles.badge,
        isTop ? { backgroundColor: TOP_COLORS[topIndex] } : { backgroundColor: theme.colors.badgeNeutralBg },
      ]}
    >
      <AppText weight="bold" style={[styles.text, { color: isTop ? theme.colors.textInverse : theme.colors.badgeNeutralText }]}> 
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
  text: {
    fontSize: 13,
    lineHeight: 16,
    includeFontPadding: false,
  },
});
