import React from 'react';
import { StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';

interface ProgressBarProps {
  progress: number;
  warning?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, warning = false }) => {
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: warning ? designSystem.colors.warning : designSystem.colors.green,
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
    backgroundColor: designSystem.colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
