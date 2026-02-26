import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
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
  return (
    <View style={styles.container}>
      <Pressable style={styles.avatarWrap} onPress={onPressAvatar}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, styles.fallback]}>
            <AppText weight="bold" style={styles.initials}>
              {name.slice(0, 1).toUpperCase()}
            </AppText>
          </View>
        )}
        <View style={styles.cameraButton}>
          <Icon name="camera" size={14} color="#0B2A1A" />
        </View>
      </Pressable>

      <AppText weight="bold" style={styles.name}>
        {name}
      </AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
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
    borderColor: '#22D663',
    backgroundColor: '#1B3328',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#DFF2E7',
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
    backgroundColor: '#22D663',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B1D15',
  },
  name: {
    marginTop: 10,
    color: '#E8F4EC',
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 2,
    color: '#90A99B',
    fontSize: 13,
    lineHeight: 17,
  },
});
