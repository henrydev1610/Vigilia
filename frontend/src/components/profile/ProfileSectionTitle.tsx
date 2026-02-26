import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { AppText } from '../ui';

interface ProfileSectionTitleProps {
  title: string;
}

const ProfileSectionTitleComponent: React.FC<ProfileSectionTitleProps> = ({ title }) => {
  return (
    <AppText weight="bold" style={styles.title}>
      {title.toUpperCase()}
    </AppText>
  );
};

export const ProfileSectionTitle = memo(ProfileSectionTitleComponent);

const styles = StyleSheet.create({
  title: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.1,
    color: '#6F8F7A',
    marginBottom: 8,
    marginTop: 14,
  },
});
