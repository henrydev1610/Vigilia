import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface ProgressBarProps {
  progress: number;
  warning?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, warning = false }) => {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceStrong }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: warning ? theme.colors.warning : theme.colors.primary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
