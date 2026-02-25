import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const theme = useAppTheme();
  const clamped = Math.max(0, Math.min(progress, 1));

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceMuted }]}> 
      <View style={[styles.fill, { backgroundColor: theme.colors.primary, width: `${clamped * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});

