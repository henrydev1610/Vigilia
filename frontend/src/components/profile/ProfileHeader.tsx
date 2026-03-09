import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  avatarUri: string | null;
  onPressAvatar: () => void;
}

const ProfileHeaderComponent: React.FC<ProfileHeaderProps> = ({
  name,
  subtitle,
  avatarUri,
  onPressAvatar,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Pressable style={styles.avatarWrap} onPress={onPressAvatar}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceStrong }]} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, styles.fallback, { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceStrong }]}>
            <AppText weight="bold" style={[styles.initials, { color: theme.colors.text }]}>
              {name.slice(0, 1).toUpperCase()}
            </AppText>
          </View>
        )}
        <View style={[styles.cameraButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.surface }]}>
          <Icon name="camera" size={14} color={theme.colors.textInverse} />
        </View>
      </Pressable>

      <AppText weight="bold" style={[styles.name, { color: theme.colors.text }]}>
        {name}
      </AppText>
      <AppText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</AppText>
    </View>
  );
};

export const ProfileHeader = memo(ProfileHeaderComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 34,
    lineHeight: 41,
  },
  cameraButton: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  name: {
    marginTop: 10,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 17,
  },
});
