import React, { memo, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { fallbackFonts, useAppTheme } from '../../theme';

export interface TrendPoint {
  key: string;
  label: string;
  value: number;
}

interface TrendChartProps {
  points: TrendPoint[];
  height?: number;
  formatValue?: (value: number) => string;
}

const TrendChartComponent: React.FC<TrendChartProps> = ({
  points,
  height = 170,
  formatValue,
}) => {
  const renderCountRef = useRef(0);
  if (__DEV__) {
    renderCountRef.current += 1;
    if (renderCountRef.current <= 20 && renderCountRef.current % 5 === 0) {
      // eslint-disable-next-line no-console
      console.log(`[perf] TrendChart renders=${renderCountRef.current} points=${points.length}`);
    }
  }

  const theme = useAppTheme();
  const width = 320;
  const padding = 18;

  const { linePath, areaPath, max, min } = useMemo(() => {
    const baselineY = height - 24;
    const baselinePath = `M ${padding} ${baselineY} L ${width - padding} ${baselineY}`;
    const baselineAreaPath = `M ${padding} ${baselineY} L ${width - padding} ${baselineY} L ${width - padding} ${baselineY} L ${padding} ${baselineY} Z`;

    if (!points.length) {
      return {
        linePath: baselinePath,
        areaPath: baselineAreaPath,
        max: 0,
        min: 0,
      };
    }

    const values = points.map((p) => p.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = Math.max(maxValue - minValue, 1);

    const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

    const plotPoints = points.map((point, index) => {
      const x = padding + index * xStep;
      const y = padding + ((maxValue - point.value) / range) * (height - padding * 2 - 24);
      return { x, y };
    });

    if (!plotPoints.length) {
      return {
        linePath: baselinePath,
        areaPath: baselineAreaPath,
        max: maxValue,
        min: minValue,
      };
    }

    const line = plotPoints
      .map((pt, index) => `${index === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
      .join(' ');

    const lastPoint = plotPoints[plotPoints.length - 1];
    const firstPoint = plotPoints[0];
    const area = `${line} L ${lastPoint.x.toFixed(2)} ${baselineY.toFixed(2)} L ${firstPoint.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;

    return {
      linePath: line || baselinePath,
      areaPath: area || baselineAreaPath,
      max: maxValue,
      min: minValue,
    };
  }, [height, padding, points, width]);

  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="chartArea" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.28" />
            <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#chartArea)" />
        <Path d={linePath} stroke={theme.colors.primary} strokeWidth={2.6} fill="none" />
      </Svg>

      <View style={styles.labelsRow}>
        {points.map((point) => (
          <Text key={point.key} style={[styles.label, { color: theme.colors.textMuted, fontFamily: fallbackFonts.body }]}>
            {point.label}
          </Text>
        ))}
      </View>

      <View style={styles.rangeRow}>
        <Text style={[styles.rangeText, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Min {formatValue ? formatValue(min) : min.toFixed(0)}</Text>
        <Text style={[styles.rangeText, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Max {formatValue ? formatValue(max) : max.toFixed(0)}</Text>
      </View>
    </View>
  );
};

export const TrendChart = memo(TrendChartComponent);

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  label: {
    fontSize: 10,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeText: {
    fontSize: 11,
  },
});
