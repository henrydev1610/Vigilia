import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import { toAbsoluteUrl } from '../../services/api';

interface ParliamentProfileHeaderProps {
  name: string;
  party: string;
  uf: string;
  avatarUrl: string | null;
  mandateLabel: string;
  statusLabel: string;
}

export const ParliamentProfileHeader: React.FC<ParliamentProfileHeaderProps> = ({
  name,
  party,
  uf,
  avatarUrl,
  mandateLabel,
  statusLabel,
}) => {
  const theme = useAppTheme();
  const uri = toAbsoluteUrl(avatarUrl) ?? avatarUrl;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {uri ? (
          <Image source={{ uri }} style={[styles.avatar, { borderColor: theme.colors.primary }]} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: theme.colors.surfaceStrong, borderColor: theme.colors.primary }]}>
            <Icon name="account" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
        <Pressable style={[styles.avatarBadge, { backgroundColor: theme.colors.primary, borderColor: theme.colors.surface }]}>
          <Icon name="check-decagram" size={14} color={theme.colors.textInverse} />
        </Pressable>
      </View>

      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
        {name}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.primary }]}> 
        PARTIDO ({party})  ESTADO - {uf}
      </Text>

      <View style={styles.chipsRow}>
        <View style={[styles.primaryChip, { backgroundColor: theme.colors.primary }]}> 
          <Text style={[styles.primaryChipLabel, { color: theme.colors.textInverse }]}>{mandateLabel}</Text>
        </View>
        <View style={styles.secondaryChip}>
          <Text style={[styles.secondaryChipLabel, { color: theme.colors.textSecondary }]}>{statusLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 18,
  },
  avatarWrap: {
    marginBottom: 14,
    position: 'relative',
  },
  avatar: {
    borderWidth: 3,
    borderRadius: 46,
    height: 92,
    width: 92,
  },
  avatarFallback: {
    alignItems: 'center',
    borderWidth: 3,
    borderRadius: 46,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  avatarBadge: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 2,
    bottom: 4,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    width: 26,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  primaryChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  primaryChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryChip: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  secondaryChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});
