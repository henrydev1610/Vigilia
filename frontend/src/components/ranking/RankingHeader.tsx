import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface RankingHeaderProps {
  updatedLabel: string;
}

const RankingHeaderComponent: React.FC<RankingHeaderProps> = ({ updatedLabel }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <AppText weight="bold" style={[styles.title, { color: theme.colors.text }]}> 
          Rankings de Despesas
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{updatedLabel}</AppText>
      </View>
      <View style={[styles.infoButton, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}> 
        <Icon name="information-outline" size={18} color={theme.colors.textSecondary} />
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
    fontSize: 37,
    lineHeight: 45,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
