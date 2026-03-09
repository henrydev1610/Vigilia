import React, { PropsWithChildren, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';

const ProfileCardComponent: React.FC<PropsWithChildren> = ({ children }) => {
  const theme = useAppTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>{children}</View>;
};

export const ProfileCard = memo(ProfileCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
