import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';

interface ProgressBarProps {
  progress: number;
}

const ProgressBarComponent: React.FC<ProgressBarProps> = ({ progress }) => {
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
};

export const ProgressBar = memo(ProgressBarComponent);

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#2E4A3E',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: designSystem.colors.green,
  },
});
