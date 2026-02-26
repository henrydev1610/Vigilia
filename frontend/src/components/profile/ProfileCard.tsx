import React, { PropsWithChildren, memo } from 'react';
import { StyleSheet, View } from 'react-native';

const ProfileCardComponent: React.FC<PropsWithChildren> = ({ children }) => {
  return <View style={styles.card}>{children}</View>;
};

export const ProfileCard = memo(ProfileCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#12281D',
    borderWidth: 1,
    borderColor: 'rgba(130, 181, 147, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
