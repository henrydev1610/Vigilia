import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme';
import { AlertStatus } from '../data/mockData';

type IconName = React.ComponentProps<typeof Icon>['name'];

interface AlertItemProps {
  name: string;
  party: string;
  state: string;
  avatarUrl?: string;
  verified?: boolean;
  status: AlertStatus;
  onPress?: () => void;
}

interface StatusContent {
  icon: IconName;
  text: string;
  tone: 'green' | 'yellow' | 'muted';
  uppercase?: boolean;
}

const statusMap: Record<AlertStatus, StatusContent> = {
  new_expense: {
    icon: 'bell-ring',
    text: 'NOVO GASTO DETECTADO',
    tone: 'green',
    uppercase: true,
  },
  atypical: {
    icon: 'alert',
    text: 'GASTO ATIPICO IDENTIFICADO',
    tone: 'yellow',
    uppercase: true,
  },
  none: {
    icon: 'bell-off',
    text: 'Nenhuma atividade recente',
    tone: 'muted',
  },
};

export const AlertItem: React.FC<AlertItemProps> = ({
  name,
  party,
  state,
  avatarUrl,
  verified,
  status,
  onPress,
}) => {
  const content = statusMap[status];
  const dotStyle = content.tone === 'green' ? styles.dotGreen : content.tone === 'yellow' ? styles.dotYellow : styles.dotMuted;
  const textStyle = content.uppercase ? styles.statusUpper : styles.statusNone;
  const iconColor = content.tone === 'green' ? colors.greenBright : content.tone === 'yellow' ? colors.alertYellow : colors.textMuted;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={styles.avatar} />}
          {verified ? (
            <View style={styles.checkBadge}>
              <Icon name="check-circle" size={14} color={colors.greenBright} />
            </View>
          ) : null}
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{`${party} - ${state}`}</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, dotStyle]} />
            <Text style={[styles.statusText, textStyle]}>{content.text}</Text>
            <Icon name={content.icon} size={14} color={iconColor} />
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
    gap: spacing.sm,
  },
  avatarWrapper: {
    height: 52,
    position: 'relative',
    width: 52,
  },
  avatar: {
    backgroundColor: colors.bgCardLight,
    borderRadius: radii.full,
    height: 52,
    width: 52,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  meta: {
    color: colors.greenText,
    fontSize: typography.fontSize.sm,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  dotGreen: {
    backgroundColor: colors.greenBright,
  },
  dotYellow: {
    backgroundColor: colors.alertYellow,
  },
  dotMuted: {
    backgroundColor: colors.textMuted,
  },
  statusText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
  },
  statusUpper: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  statusNone: {
    color: colors.textMuted,
  },
});
