import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
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
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: theme.colors.border }]}> 
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.primarySoft }]}>
          <Icon name={icon} size={16} color={theme.colors.primary} />
        </View>
        <AppText weight="medium" style={[styles.label, { color: theme.colors.text }]}> 
          {label}
        </AppText>
      </View>
      <View style={styles.right}>
        {value ? (
          <AppText numberOfLines={1} style={[styles.value, { color: theme.colors.textSecondary }]}>
            {value}
          </AppText>
        ) : null}
        {rightNode}
        {showChevron ? <Icon name="chevron-right" size={18} color={theme.colors.textMuted} /> : null}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
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
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'right',
    flexShrink: 1,
  },
});
