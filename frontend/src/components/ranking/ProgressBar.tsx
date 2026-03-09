import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface ProgressBarProps {
  progress: number;
}

const ProgressBarComponent: React.FC<ProgressBarProps> = ({ progress }) => {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceStrong }]}> 
      <View style={[styles.fill, { backgroundColor: theme.colors.primary, width: `${clamped * 100}%` }]} />
    </View>
  );
};

export const ProgressBar = memo(ProgressBarComponent);

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
