import React, { PropsWithChildren, useMemo } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';

interface ScreenBackgroundProps extends PropsWithChildren {
  includeBottomInset?: boolean;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, includeBottomInset = false }) => {
  const theme = useAppTheme();
  const verticalLines = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  const horizontalLines = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  const edges = includeBottomInset ? (['top', 'bottom'] as const) : (['top'] as const);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={edges}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.bg, { backgroundColor: theme.colors.background }]}>
        {verticalLines.map((index) => (
          <View key={`v-${index}`} style={[styles.vLine, { backgroundColor: theme.colors.gridLine, left: `${(index + 1) * 12}%` }]} />
        ))}
        {horizontalLines.map((index) => (
          <View key={`h-${index}`} style={[styles.hLine, { backgroundColor: theme.colors.gridLine, top: `${(index + 1) * 7}%` }]} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    flex: 1,
  },
});
