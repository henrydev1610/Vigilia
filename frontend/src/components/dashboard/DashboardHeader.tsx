import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts } from '../../theme';
import { AppLogo } from '../branding/AppLogo';
import { HeaderProfileButton } from '../header';

interface DashboardHeaderProps {
  alertsCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ alertsCount = 0 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandWrap}>
        <View style={styles.logoBox}>
          <AppLogo variant="header" size={100} />
        </View>
        <View>
          <Text style={[styles.title, { fontFamily: fallbackFonts.headingBold }]}>Vigília</Text>
          <Text style={[styles.subtitle, { fontFamily: fallbackFonts.bodyMedium }]}>TRANSPARÊNCIA FEDERAL</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.bellWrap}>
          <Icon name="bell" size={20} color="#95A7C0" />
          {alertsCount > 0 ? (
            <View style={styles.alertBadge}>
              <Text style={[styles.alertBadgeText, { fontFamily: fallbackFonts.headingBold }]}>
                {alertsCount > 99 ? '99+' : String(alertsCount)}
              </Text>
            </View>
          ) : null}
        </View>
        <HeaderProfileButton iconSize={21} iconColor="#95A7C0" />
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
    backgroundColor: '#062A1A',
    borderRadius: 13,
    height: 60,
    justifyContent: 'center',
    width: 74,
  },
  title: {
    color: '#F2F5F7',
    fontSize: 30,
    lineHeight: 40,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#5A6D87',
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
    backgroundColor: '#FF4D4F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    position: 'absolute',
    right: -7,
    top: -6,
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 11,
  },
});
