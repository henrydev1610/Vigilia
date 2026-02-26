import React, { memo } from 'react';
import { Switch } from 'react-native';
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
  return (
    <ProfileRow
      icon={icon}
      label={label}
      rightNode={(
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#3A4F44', true: '#1FD867' }}
          thumbColor={value ? '#DCF7E7' : '#B5C5BB'}
          ios_backgroundColor="#3A4F44"
        />
      )}
    />
  );
};

export const ProfileToggleRow = memo(ProfileToggleRowComponent);
