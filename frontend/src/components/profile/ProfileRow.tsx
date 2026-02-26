import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../ui';

interface ProfileRowProps {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  rightNode?: React.ReactNode;
}

const ProfileRowComponent: React.FC<ProfileRowProps> = ({
  icon,
  label,
  value,
  showChevron = false,
  onPress,
  rightNode,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Icon name={icon} size={16} color="#8FE9A8" />
        </View>
        <AppText weight="medium" style={styles.label}>
          {label}
        </AppText>
      </View>
      <View style={styles.right}>
        {value ? (
          <AppText numberOfLines={1} style={styles.value}>
            {value}
          </AppText>
        ) : null}
        {rightNode}
        {showChevron ? <Icon name="chevron-right" size={18} color="#6E8A7B" /> : null}
      </View>
    </Pressable>
  );
};

export const ProfileRow = memo(ProfileRowComponent);

const styles = StyleSheet.create({
  row: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(130, 181, 147, 0.11)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(143, 233, 168, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#E6F2EA',
    fontSize: 14,
    lineHeight: 18,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    maxWidth: '58%',
  },
  value: {
    color: '#A2BAAD',
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'right',
    flexShrink: 1,
  },
});
