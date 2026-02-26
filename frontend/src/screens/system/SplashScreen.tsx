import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { AppLogo } from '../../components/branding/AppLogo';
import { brandLightGreen } from '../../theme/brand';

type SplashScreenProps = {
  readyToExit: boolean;
  onFinish: () => void;
  onFirstFrame: () => void;
};

const MIN_SPLASH_MS = 1800;
const GRID_GAP = 28;

const GridOverlay = memo(function GridOverlay() {
  const { width, height } = useMemo(() => Dimensions.get('window'), []);
  const verticalLines = Math.ceil(width / GRID_GAP) + 1;
  const horizontalLines = Math.ceil(height / GRID_GAP) + 1;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.gridLayer}>
        {Array.from({ length: verticalLines }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.verticalLine, { left: index * GRID_GAP }]} />
        ))}
        {Array.from({ length: horizontalLines }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.horizontalLine, { top: index * GRID_GAP }]} />
        ))}
      </View>
    </View>
  );
});

export const SplashScreen = memo(function SplashScreen({
  readyToExit,
  onFinish,
  onFirstFrame,
}: SplashScreenProps) {
  const firstFrameNotifiedRef = useRef(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [minDurationReached, setMinDurationReached] = useState(false);
  const [exitStarted, setExitStarted] = useState(false);

  const containerOpacity = useSharedValue(1);
  const circleOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0.92);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(10);

  const handleLayout = useCallback(() => {
    if (firstFrameNotifiedRef.current) return;
    firstFrameNotifiedRef.current = true;
    onFirstFrame();
  }, [onFirstFrame]);

  useEffect(() => {
    circleOpacity.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) });
    circleScale.value = withTiming(1, { duration: 700, easing: Easing.bezier(0.22, 1, 0.36, 1) });

    subtitleOpacity.value = withDelay(360, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    subtitleTranslateY.value = withDelay(360, withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }, () => {
      runOnJS(setIntroFinished)(true);
    }));

    containerOpacity.value = withDelay(MIN_SPLASH_MS, withTiming(1, { duration: 1 }, () => {
      runOnJS(setMinDurationReached)(true);
    }));

    return () => {
      cancelAnimation(containerOpacity);
      cancelAnimation(circleOpacity);
      cancelAnimation(circleScale);
      cancelAnimation(subtitleOpacity);
      cancelAnimation(subtitleTranslateY);
    };
  }, [circleOpacity, circleScale, containerOpacity, subtitleOpacity, subtitleTranslateY]);

  useEffect(() => {
    if (!readyToExit || !introFinished || !minDurationReached || exitStarted) return;

    setExitStarted(true);
    containerOpacity.value = withTiming(0, { duration: 280, easing: Easing.inOut(Easing.quad) }, () => {
      runOnJS(onFinish)();
    });
  }, [containerOpacity, exitStarted, introFinished, minDurationReached, onFinish, readyToExit]);

  const containerAnimated = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const circleAnimated = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }],
  }));

  const subtitleAnimated = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.root, containerAnimated]} onLayout={handleLayout}>
      <View style={styles.background} />
      <GridOverlay />
      <View style={styles.center}>
        <Animated.View style={[styles.circle, circleAnimated]}>
          <AppLogo size={250} />
          <Text style={styles.title}>Vigilia</Text>
        </Animated.View>
        <Animated.View style={subtitleAnimated}>
          <Text style={styles.subtitle}>TRANSPARÊNCIA FEDERAL</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#031b10',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#032113',
  },
  gridLayer: {
    flex: 1,
    opacity: 0.22,
  },
  verticalLine: {
    position: 'absolute',
    width: 1,
    top: 0,
    bottom: 0,
    backgroundColor: '#1f533d',
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    left: 0,
    right: 0,
    backgroundColor: '#1f533d',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#084329',
    borderWidth: 1.2,
    borderColor: 'rgba(110, 231, 168, 0.36)',
    shadowColor: brandLightGreen,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    marginTop: -40,
    fontSize: 50,
    lineHeight: 60,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'System',
    }),
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
    letterSpacing: 0,
    paddingBottom: 2,
    color: '#EBF7EF',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 24,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 2.4,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    fontWeight: '600',
    color: 'rgba(110, 231, 168, 0.9)',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
