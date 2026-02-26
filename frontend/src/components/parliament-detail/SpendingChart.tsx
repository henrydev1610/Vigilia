import React, { memo, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface SpendingPoint {
  key: string;
  label: string;
  value: number;
}

interface SpendingChartProps {
  points: SpendingPoint[];
  xLabelStep?: number;
}

interface CartesianPoint {
  x: number;
  y: number;
}

function buildSmoothPath(points: CartesianPoint[]) {
  if (points.length < 2) {
    return points.length === 1 ? `M ${points[0].x} ${points[0].y}` : '';
  }

  const tension = 0.2;
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];

    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

const SpendingChartComponent: React.FC<SpendingChartProps> = ({ points, xLabelStep }) => {
  const [chartWidth, setChartWidth] = useState(0);
  const chartHeight = 178;
  const innerPadding = 18;
  const baseline = chartHeight - 18;

  const parsedPoints = useMemo(
    () => points.map((item) => ({ ...item, label: item.label.toUpperCase() })),
    [points],
  );

  const visibleLabelIndexes = useMemo(() => {
    if (parsedPoints.length <= 8) {
      return new Set(parsedPoints.map((_, idx) => idx));
    }
    const autoStep = xLabelStep ?? (parsedPoints.length > 24 ? 5 : 4);
    const indexes = new Set<number>([0, parsedPoints.length - 1]);
    for (let idx = 0; idx < parsedPoints.length; idx += autoStep) {
      indexes.add(idx);
    }
    return indexes;
  }, [parsedPoints, xLabelStep]);

  const { linePath, areaPath } = useMemo(() => {
    if (chartWidth <= 0 || parsedPoints.length === 0) {
      return { linePath: '', areaPath: '' };
    }

    const max = Math.max(...parsedPoints.map((point) => point.value), 1);
    const min = Math.min(...parsedPoints.map((point) => point.value), 0);
    const range = Math.max(1, max - min);

    const xStep = parsedPoints.length > 1
      ? (chartWidth - innerPadding * 2) / (parsedPoints.length - 1)
      : 0;

    const plotPoints = parsedPoints.map((point, index) => {
      const x = innerPadding + xStep * index;
      const y = innerPadding + ((max - point.value) / range) * (chartHeight - innerPadding * 2 - 20);
      return { x, y };
    });

    const smoothLine = buildSmoothPath(plotPoints);
    if (!smoothLine || plotPoints.length === 0) {
      return { linePath: '', areaPath: '' };
    }

    const first = plotPoints[0];
    const last = plotPoints[plotPoints.length - 1];
    const area = `${smoothLine} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;

    return { linePath: smoothLine, areaPath: area };
  }, [baseline, chartWidth, innerPadding, parsedPoints]);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.max(0, event.nativeEvent.layout.width);
    if (nextWidth !== chartWidth) {
      setChartWidth(nextWidth);
    }
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      {chartWidth > 0 ? (
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="spendingArea" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0%" stopColor="#24E06F" stopOpacity={0.52} />
              <Stop offset="100%" stopColor="#24E06F" stopOpacity={0.04} />
            </LinearGradient>
          </Defs>
        <Path d={areaPath} fill="url(#spendingArea)" />
        <Path d={linePath} fill="none" stroke="#1FE26C" strokeWidth={3} strokeLinecap="round" />
      </Svg>
      ) : null}

      <View style={styles.labelsRow}>
        {parsedPoints.map((point, index) => (
          <Text key={point.key} style={styles.label}>
            {visibleLabelIndexes.has(index) ? point.label : ' '}
          </Text>
        ))}
      </View>
    </View>
  );
};

export const SpendingChart = memo(SpendingChartComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0E2C1D',
    borderRadius: 20,
    marginTop: 14,
    overflow: 'hidden',
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  label: {
    color: '#718F80',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
});
