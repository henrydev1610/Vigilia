import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface RankingFooterSummaryProps {
  totalLabel: string;
  bottomOffset: number;
}

const RankingFooterSummaryComponent: React.FC<RankingFooterSummaryProps> = ({
  totalLabel,
  bottomOffset,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.primary }]}> 
        <View style={styles.left}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.overlay }]}> 
            <Icon name="chart-box-outline" size={20} color={theme.colors.textInverse} />
          </View>
          <View>
            <AppText weight="bold" style={[styles.caption, { color: theme.colors.textInverse }]}> 
              TOTAL MONITORADO
            </AppText>
            <AppText weight="bold" style={[styles.total, { color: theme.colors.textInverse }]}> 
              {totalLabel}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export const RankingFooterSummary = memo(RankingFooterSummaryComponent);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    marginBottom: -111,
    left: 10,
    right: 10,
  },
  card: {
    minHeight: 72,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 10,
    lineHeight: 13,
  },
  total: {
    fontSize: 34,
    lineHeight: 41,
  },
});
