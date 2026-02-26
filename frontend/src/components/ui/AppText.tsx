import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

interface AppTextProps extends TextProps {
  weight?: 'regular' | 'medium' | 'bold';
  size?: number;
  lineHeight?: number;
  style?: StyleProp<TextStyle>;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  weight = 'regular',
  size,
  lineHeight,
  style,
  ...rest
}) => {
  const theme = useAppTheme();

  const fontFamily =
    weight === 'bold' ? fallbackFonts.headingBold : weight === 'medium' ? fallbackFonts.bodyMedium : fallbackFonts.body;
  const fontSize = size ?? theme.typography.size.body;
  const safeLineHeight = lineHeight ?? Math.max(theme.typography.lineHeight.body, Math.ceil(fontSize * 1.25));

  return (
    <Text
      {...rest}
      style={[
        styles.base,
        {
          color: theme.colors.text,
          fontFamily,
          fontSize,
          lineHeight: safeLineHeight,
          letterSpacing: Platform.OS === 'android' ? 0 : 0.1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
