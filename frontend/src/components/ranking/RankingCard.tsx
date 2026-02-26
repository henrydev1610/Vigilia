import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';
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
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.leftCluster}>
          <RankBadge rank={rank} />
          <View style={styles.avatarWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <AppText weight="bold" style={styles.avatarFallbackText}>
                  {name.slice(0, 1).toUpperCase()}
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.center}>
          <AppText weight="bold" numberOfLines={1} style={styles.name}>
            {name}
          </AppText>
          <AppText weight="medium" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </AppText>
        </View>

        <AppText weight="bold" numberOfLines={1} style={styles.amount}>
          {amountLabel}
        </AppText>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={progress} />
        <View style={styles.progressLabels}>
          <AppText style={styles.progressHint}>Cota Parlamentar</AppText>
          <AppText style={styles.progressHint}>Limite: {limitLabel}</AppText>
        </View>
      </View>
    </View>
  );
};

export const RankingCard = memo(RankingCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#112C20',
    borderRadius: designSystem.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(143, 233, 168, 0.14)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 10,
    ...designSystem.shadow.card,
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
    zIndex:-100
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  avatarFallback: {
    backgroundColor: '#2E4B3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#E8F5EC',
    fontSize: 19,
    lineHeight: 24,
  },
  center: {
    marginTop:14,
    marginLeft:-20,
    flex: 1,
    paddingRight: 8,
  },
  name: {
    color: '#E7F4EC',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8CA69A',
    fontSize: 13,
    lineHeight: 16,
    marginTop: 1,
  },
  amount: {
    color: designSystem.colors.green,
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
    color: '#6A8577',
    fontSize: 10,
    lineHeight: 13,
  },
});
