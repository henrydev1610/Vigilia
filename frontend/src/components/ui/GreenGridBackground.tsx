import React, { memo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

interface GreenGridBackgroundProps {
  style?: StyleProp<ViewStyle>;
  baseColor?: string;
  lineColor?: string;
  lineOpacity?: number;
  cellSize?: number;
}

const GreenGridBackgroundComponent: React.FC<GreenGridBackgroundProps> = ({
  style,
  baseColor = '#06160F',
  lineColor = '#5CCB92',
  lineOpacity = 0.06,
  cellSize = 32,
}) => {
  return (
    <View pointerEvents="none" style={[styles.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="green-grid-pattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <Path
              d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
              fill="none"
              opacity={lineOpacity}
              stroke={lineColor}
              strokeWidth={1}
            />
          </Pattern>
        </Defs>

        <Rect width="100%" height="100%" fill={baseColor} />
        <Rect width="100%" height="100%" fill="url(#green-grid-pattern)" />
      </Svg>
    </View>
  );
};

export const GreenGridBackground = memo(GreenGridBackgroundComponent);

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
  },
});

