import React, { memo, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { formatCurrencyBRL } from '../../utils/format';
import { useAppTheme, useDesignSystem } from '../../theme';
import { AppText } from '../ui';
import { ProgressBar } from './ProgressBar';

const MONTHLY_LIMIT = 46000;

const UF_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapa',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceara',
  DF: 'Distrito Federal',
  ES: 'Espirito Santo',
  GO: 'Goias',
  MA: 'Maranhao',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Para',
  PB: 'Paraiba',
  PR: 'Parana',
  PE: 'Pernambuco',
  PI: 'Piaui',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondonia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'Sao Paulo',
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
  const theme = useAppTheme();
  const designSystem = useDesignSystem();
  const usage = useMemo(() => Math.max(0, Math.min(monthlySpent / MONTHLY_LIMIT, 1)), [monthlySpent]);
  const usagePct = usage * 100;
  const isWarning = usagePct >= 85;
  const stateName = UF_NAMES[uf.toUpperCase()] ?? uf.toUpperCase();

  return (
    <Pressable
      onPress={() => onPress(id, name)}
      style={[
        styles.card,
        {
          backgroundColor: designSystem.colors.card,
          borderColor: theme.colors.border,
          ...designSystem.shadow.card,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.surfaceStrong }]}>
              <AppText weight="bold" style={[styles.avatarFallbackText, { color: designSystem.colors.textPrimary }]}>
                {name.slice(0, 1).toUpperCase()}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.mainInfo}>
          <AppText weight="bold" style={[styles.name, { color: designSystem.colors.textPrimary }]}>
            {name}
          </AppText>
          <AppText weight="medium" style={[styles.partyState, { color: designSystem.colors.green }]}> 
            {party} / {stateName} ({uf.toUpperCase()})
          </AppText>
        </View>

        <Icon name="chevron-right" size={22} color={theme.colors.textMuted} />
      </View>

      <View style={styles.progressHeader}>
        <AppText weight="bold" style={[styles.progressLabel, { color: designSystem.colors.textMuted }]}>
          USO DA COTA PARLAMENTAR
        </AppText>
        <AppText weight="bold" style={[styles.progressPct, { color: isWarning ? theme.colors.warning : designSystem.colors.green }]}>
          {usagePct.toFixed(1)}%
        </AppText>
      </View>
      <ProgressBar progress={usage} warning={isWarning} />

      <View style={styles.footerRow}>
        <AppText style={[styles.footerText, { color: designSystem.colors.textMuted }]}>Gasto: {formatCurrencyBRL(monthlySpent)}</AppText>
        <AppText style={[styles.footerText, { color: designSystem.colors.textMuted }]}>Limite: {formatCurrencyBRL(MONTHLY_LIMIT)}</AppText>
      </View>
    </Pressable>
  );
};

export const DeputyCard = memo(DeputyCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 22,
    lineHeight: 28,
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    fontSize: 30,
    lineHeight: 37,
  },
  partyState: {
    fontSize: 15,
    lineHeight: 19,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  progressPct: {
    fontSize: 24,
    lineHeight: 30,
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
