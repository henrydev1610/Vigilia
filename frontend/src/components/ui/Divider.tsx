import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../theme';

interface DividerProps {
  marginVertical?: number;
}

export const Divider: React.FC<DividerProps> = ({ marginVertical }) => {
  const theme = useAppTheme();
  return (
    <View
      style={{
        height: 1,
        width: '100%',
        backgroundColor: theme.colors.border,
        marginVertical: marginVertical ?? theme.spacing.md,
      }}
    />
  );
};

