import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';
import { AppText } from '../ui';

interface RankingFooterSummaryProps {
  totalLabel: string;
  bottomOffset: number;
}

const RankingFooterSummaryComponent: React.FC<RankingFooterSummaryProps> = ({
  totalLabel,
  bottomOffset,
}) => {
  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]}>
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.iconWrap}>
            <Icon name="chart-box-outline" size={20} color="#0D1F14" />
          </View>
          <View>
            <AppText weight="bold" style={styles.caption}>
              TOTAL MONITORADO
            </AppText>
            <AppText weight="bold" style={styles.total}>
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
    marginBottom:-111,
    left: 10,
    right: 10,
  },
  card: {
    minHeight: 72,
    borderRadius: 14,
    backgroundColor: designSystem.colors.green,
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
    backgroundColor: 'rgba(7, 27, 17, 0.22)',
  },
  caption: {
    color: '#123425',
    fontSize: 10,
    lineHeight: 13,
  },
  total: {
    color: '#0A2417',
    fontSize: 34,
    lineHeight: 41,
  },
});
