import React, { PropsWithChildren, useMemo } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '../branding/AppLogo';

const GRID_GAP = 28;

function GridOverlay() {
  const { width, height } = Dimensions.get('window');
  const verticalLines = Math.ceil(width / GRID_GAP) + 1;
  const horizontalLines = Math.ceil(height / GRID_GAP) + 1;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.gridLayer}>
        {Array.from({ length: verticalLines }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.verticalLine, { left: index * GRID_GAP }]} />
        ))}
        {Array.from({ length: horizontalLines }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.horizontalLine, { top: index * GRID_GAP }]} />
        ))}
      </View>
    </View>
  );
}

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footerText?: string;
}>;

export function AuthLayout({ title, subtitle, footerText, children }: AuthLayoutProps) {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.background} />
      <GridOverlay />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoShell}>
              <AppLogo variant="header" size={180} />
            </View>
            <Text style={styles.brandTitle}>{title}</Text>
            <Text style={styles.brandSubtitle}>{subtitle}</Text>
          </View>

          {children}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {footerText ?? `© ${year} VIGÍLIA - MONITORAMENTO DE DADOS PÚBLICOS`}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#031b10',
  },
  flex: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#032113',
  },
  gridLayer: {
    flex: 1,
    opacity: 0.22,
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    bottom: 0,
    top: 0,
    backgroundColor: '#1f533d',
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    left: 0,
    right: 0,
    backgroundColor: '#1f533d',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  logoShell: {
    width: 120,
    height: 120,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#084329',
    borderWidth: 1,
    borderColor: 'rgba(52, 224, 120, 0.35)',
    shadowColor: '#10b454',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  brandTitle: {
    marginTop: 18,
    color: '#f3f7f4',
    fontSize: 50,
    padding:20,
    lineHeight: 56,
    fontWeight: '800',
  },
  brandSubtitle: {
    marginTop: 18,
    color: '#1ed56c',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: -10,
    
    letterSpacing: 3.6,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 12,
  },
  footerText: {
    color: 'rgba(169, 195, 179, 0.64)',
    fontSize: 12,
    letterSpacing: 2.1,
    textAlign: 'center',
    fontWeight: '600',
  },
});
