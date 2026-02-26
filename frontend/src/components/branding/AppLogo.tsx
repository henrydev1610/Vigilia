import React, { memo } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import BrandLogo from '../../assets/logo.svg';
import { brandLightGreen } from '../../theme/brand';

type AppLogoVariant = 'default' | 'mono' | 'header';

type AppLogoProps = {
  variant?: AppLogoVariant;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

const LOGO_RATIO = 832 / 1248;

export const AppLogo = memo(function AppLogo({
  variant = 'default',
  size = 40,
  color,
  style,
}: AppLogoProps) {
  const themedColor = brandLightGreen;

  const variantColor = {
    default: themedColor,
    mono: themedColor,
    header: themedColor,
  }[variant];

  const resolvedColor = color ?? variantColor;

  return (
    <View style={style}>
      <BrandLogo width={size} height={size * LOGO_RATIO} color={resolvedColor} />
    </View>
  );
});
