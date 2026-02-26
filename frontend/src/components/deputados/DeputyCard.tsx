import React, { memo, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { formatCurrencyBRL } from '../../utils/format';
import { designSystem } from '../../theme';
import { AppText } from '../ui';
import { ProgressBar } from './ProgressBar';

const MONTHLY_LIMIT = 46000;

const UF_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

interface DeputyCardProps {
  id: number;
  name: string;
  party: string;
  uf: string;
  imageUri?: string;
  monthlySpent: number;
  onPress: (id: number, name: string) => void;
}

const DeputyCardComponent: React.FC<DeputyCardProps> = ({
  id,
  name,
  party,
  uf,
  imageUri,
  monthlySpent,
  onPress,
}) => {
  const usage = useMemo(() => Math.max(0, Math.min(monthlySpent / MONTHLY_LIMIT, 1)), [monthlySpent]);
  const usagePct = usage * 100;
  const isWarning = usagePct >= 85;
  const stateName = UF_NAMES[uf.toUpperCase()] ?? uf.toUpperCase();

  return (
    <Pressable onPress={() => onPress(id, name)} style={styles.card}>
      <View style={styles.topRow}>
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

        <View style={styles.mainInfo}>
          <AppText weight="bold" style={styles.name}>
            {name}
          </AppText>
          <AppText weight="medium" style={styles.partyState}>
            {party} / {stateName} ({uf.toUpperCase()})
          </AppText>
        </View>

        <Icon name="chevron-right" size={22} color="#8FA89B" />
      </View>

      <View style={styles.progressHeader}>
        <AppText weight="bold" style={styles.progressLabel}>
          USO DA COTA PARLAMENTAR
        </AppText>
        <AppText weight="bold" style={[styles.progressPct, { color: isWarning ? designSystem.colors.warning : designSystem.colors.green }]}>
          {usagePct.toFixed(1)}%
        </AppText>
      </View>
      <ProgressBar progress={usage} warning={isWarning} />

      <View style={styles.footerRow}>
        <AppText style={styles.footerText}>Gasto: {formatCurrencyBRL(monthlySpent)}</AppText>
        <AppText style={styles.footerText}>Limite: {formatCurrencyBRL(MONTHLY_LIMIT)}</AppText>
      </View>
    </Pressable>
  );
};

export const DeputyCard = memo(DeputyCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.radius.card,
    backgroundColor: designSystem.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(143, 233, 168, 0.14)',
    paddingHorizontal: designSystem.spacing.sm,
    paddingVertical: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.sm,
    ...designSystem.shadow.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designSystem.spacing.sm,
  },
  avatarWrap: {
    marginRight: designSystem.spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#315845',
  },
  avatarFallbackText: {
    color: designSystem.colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    color: designSystem.colors.textPrimary,
    fontSize: 30,
    lineHeight: 37,
  },
  partyState: {
    color: designSystem.colors.green,
    fontSize: 15,
    lineHeight: 19,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designSystem.spacing.xs,
  },
  progressLabel: {
    color: designSystem.colors.textMuted,
    fontSize: designSystem.typography.sizes.label,
    lineHeight: designSystem.typography.lineHeights.label,
    letterSpacing: 0.4,
  },
  progressPct: {
    fontSize: 24,
    lineHeight: 30,
  },
  footerRow: {
    marginTop: designSystem.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: designSystem.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
  },
});
