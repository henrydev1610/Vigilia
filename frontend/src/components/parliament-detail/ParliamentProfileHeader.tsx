import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
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
  const uri = toAbsoluteUrl(avatarUrl) ?? avatarUrl;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {uri ? (
          <Image source={{ uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Icon name="account" size={40} color="#B6CBBF" />
          </View>
        )}
        <Pressable style={styles.avatarBadge}>
          <Icon name="check-decagram" size={14} color="#052113" />
        </Pressable>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <Text style={styles.subtitle}>
        PARTIDO ({party})  ESTADO - {uf}
      </Text>

      <View style={styles.chipsRow}>
        <View style={styles.primaryChip}>
          <Text style={styles.primaryChipLabel}>{mandateLabel}</Text>
        </View>
        <View style={styles.secondaryChip}>
          <Text style={styles.secondaryChipLabel}>{statusLabel}</Text>
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
    borderColor: '#1EE26D',
    borderWidth: 3,
    borderRadius: 46,
    height: 92,
    width: 92,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#294234',
    borderColor: '#1EE26D',
    borderWidth: 3,
    borderRadius: 46,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  avatarBadge: {
    alignItems: 'center',
    backgroundColor: '#17D968',
    borderColor: '#0A2819',
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
    color: '#E8F6EE',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: '#29C56A',
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
    backgroundColor: '#1BD165',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  primaryChipLabel: {
    color: '#07321B',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryChip: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  secondaryChipLabel: {
    color: '#D9F1E2',
    fontSize: 12,
    fontWeight: '700',
  },
});
