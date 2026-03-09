import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';
import { ProgressBar } from './ProgressBar';
import { RankBadge } from './RankBadge';

interface RankingCardProps {
  rank: number;
  name: string;
  subtitle: string;
  amountLabel: string;
  progress: number;
  limitLabel: string;
  imageUri?: string;
}

const RankingCardComponent: React.FC<RankingCardProps> = ({
  rank,
  name,
  subtitle,
  amountLabel,
  progress,
  limitLabel,
  imageUri,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadow.card.shadowColor }]}> 
      <View style={styles.topRow}>
        <View style={styles.leftCluster}>
          <RankBadge rank={rank} />
          <View style={styles.avatarWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.surfaceStrong }]}>
                <AppText weight="bold" style={[styles.avatarFallbackText, { color: theme.colors.text }]}> 
                  {name.slice(0, 1).toUpperCase()}
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.center}>
          <AppText weight="bold" numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}> 
            {name}
          </AppText>
          <AppText weight="medium" numberOfLines={1} style={[styles.subtitle, { color: theme.colors.textSecondary }]}> 
            {subtitle}
          </AppText>
        </View>

        <AppText weight="bold" numberOfLines={1} style={[styles.amount, { color: theme.colors.primary }]}> 
          {amountLabel}
        </AppText>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={progress} />
        <View style={styles.progressLabels}>
          <AppText style={[styles.progressHint, { color: theme.colors.textMuted }]}>Cota Parlamentar</AppText>
          <AppText style={[styles.progressHint, { color: theme.colors.textMuted }]}>Limite: {limitLabel}</AppText>
        </View>
      </View>
    </View>
  );
};

export const RankingCard = memo(RankingCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftCluster: {
    width: 74,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  avatarWrap: {
    marginTop: -10,
    zIndex: -100,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 19,
    lineHeight: 24,
  },
  center: {
    marginTop: 14,
    marginLeft: -20,
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 16,
    marginTop: 1,
  },
  amount: {
    fontSize: 18,
    lineHeight: 23,
    minWidth: 90,
    textAlign: 'right',
  },
  progressWrap: {
    gap: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressHint: {
    fontSize: 10,
    lineHeight: 13,
  },
});
