import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts } from '../../theme';

export const DashboardHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.brandWrap}>
        <View style={styles.logoBox}>
          <Icon name="shield-account" size={40} color="#22D663" />
        </View>
        <View>
          <Text style={[styles.title, { fontFamily: fallbackFonts.headingBold }]}>Vigília</Text>
          <Text style={[styles.subtitle, { fontFamily: fallbackFonts.bodyMedium }]}>TRANSPARÊNCIA FEDERAL</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Icon name="bell" size={20} color="#95A7C0" />
        <Icon name="account-circle" size={21} color="#95A7C0" />
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
    marginTop:10,
    justifyContent: 'center',
    width: 60,
  },
  title: {
    color: '#F2F5F7',
    fontSize: 30,
    marginTop:10,
    lineHeight: 40,
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#5A6D87',
    fontSize: 11,
    letterSpacing: 1.1,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
