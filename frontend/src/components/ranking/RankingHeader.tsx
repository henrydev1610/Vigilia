import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';
import { AppText } from '../ui';

interface RankingHeaderProps {
  updatedLabel: string;
}

const RankingHeaderComponent: React.FC<RankingHeaderProps> = ({ updatedLabel }) => {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <AppText weight="bold" style={styles.title}>
          Rankings de Despesas
        </AppText>
        <AppText style={styles.subtitle}>{updatedLabel}</AppText>
      </View>
      <View style={styles.infoButton}>
        <Icon name="information-outline" size={18} color="#C8D6CD" />
      </View>
    </View>
  );
};

export const RankingHeader = memo(RankingHeaderComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    color: '#E7F4EC',
    fontSize: 37,
    lineHeight: 45,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9BB2A5',
    fontSize: 14,
    lineHeight: 18,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#234536',
    borderWidth: 1,
    borderColor: 'rgba(143, 233, 168, 0.18)',
  },
});
