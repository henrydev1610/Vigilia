import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface ProfileSectionTitleProps {
  title: string;
}

const ProfileSectionTitleComponent: React.FC<ProfileSectionTitleProps> = ({ title }) => {
  const theme = useAppTheme();
  return (
    <AppText weight="bold" style={[styles.title, { color: theme.colors.textMuted }]}> 
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
    marginBottom: 8,
    marginTop: 14,
  },
});
