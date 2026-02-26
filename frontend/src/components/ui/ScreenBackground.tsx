import React, { PropsWithChildren, useMemo } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { designSystem } from '../../theme';

interface ScreenBackgroundProps extends PropsWithChildren {
  includeBottomInset?: boolean;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, includeBottomInset = false }) => {
  const verticalLines = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  const horizontalLines = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  const edges = includeBottomInset ? (['top', 'bottom'] as const) : (['top'] as const);

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar barStyle="light-content" />
      <View style={styles.bg}>
        {verticalLines.map((index) => (
          <View key={`v-${index}`} style={[styles.vLine, { left: `${(index + 1) * 12}%` }]} />
        ))}
        {horizontalLines.map((index) => (
          <View key={`h-${index}`} style={[styles.hLine, { top: `${(index + 1) * 7}%` }]} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: designSystem.colors.bg,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: designSystem.colors.bg,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(143, 233, 168, 0.045)',
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(143, 233, 168, 0.04)',
  },
  content: {
    flex: 1,
  },
});
