import React, { memo } from 'react';
import { Switch } from 'react-native';
import { useAppTheme } from '../../theme';
import { ProfileRow } from './ProfileRow';

interface ProfileToggleRowProps {
  icon: React.ComponentProps<typeof ProfileRow>['icon'];
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const ProfileToggleRowComponent: React.FC<ProfileToggleRowProps> = ({
  icon,
  label,
  value,
  onValueChange,
}) => {
  const theme = useAppTheme();

  return (
    <ProfileRow
      icon={icon}
      label={label}
      rightNode={(
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.colors.surfaceStrong, true: theme.colors.primary }}
          thumbColor={value ? theme.colors.textInverse : theme.colors.textMuted}
          ios_backgroundColor={theme.colors.surfaceStrong}
        />
      )}
    />
  );
};

export const ProfileToggleRow = memo(ProfileToggleRowComponent);
