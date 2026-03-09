import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts, useAppTheme } from '../../theme';
import { AppLogo } from '../branding/AppLogo';
import { HeaderProfileButton } from '../header';

interface DashboardHeaderProps {
  alertsCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ alertsCount = 0 }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.brandWrap}>
        <View style={[styles.logoBox, { backgroundColor: theme.colors.surfaceAlt }]}> 
          <AppLogo variant="header" size={100} />
        </View>
        <View>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Vigilia</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>TRANSPARENCIA FEDERAL</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.bellWrap}>
          <Icon name="bell" size={20} color={theme.colors.textSecondary} />
          {alertsCount > 0 ? (
            <View style={[styles.alertBadge, { backgroundColor: theme.colors.danger }]}> 
              <Text style={[styles.alertBadgeText, { color: theme.colors.textInverse, fontFamily: fallbackFonts.headingBold }]}>
                {alertsCount > 99 ? '99+' : String(alertsCount)}
              </Text>
            </View>
          ) : null}
        </View>
        <HeaderProfileButton iconSize={21} iconColor={theme.colors.textSecondary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logoBox: {
    alignItems: 'center',
    borderRadius: 13,
    height: 60,
    justifyContent: 'center',
    width: 74,
  },
  title: {
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 1.1,
    marginTop: 6,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  bellWrap: {
    position: 'relative',
    padding: 2,
  },
  alertBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    position: 'absolute',
    right: -7,
    top: -6,
  },
  alertBadgeText: {
    fontSize: 9,
    lineHeight: 11,
  },
});
