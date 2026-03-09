import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface ProgressBarProps {
  progress: number;
  trackColor?: string;
  fillColor?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  trackColor,
  fillColor,
  height = 8,
}) => {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <View style={[styles.track, { backgroundColor: trackColor ?? theme.colors.surfaceStrong, height }]}>
      <View style={[styles.fill, { backgroundColor: fillColor ?? theme.colors.primary, width: `${clamped * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 999,
    height: '100%',
  },
});
