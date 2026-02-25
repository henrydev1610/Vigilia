import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, radii } from '../theme';

interface ProfileAvatarProps {
  uri?: string;
  onPress?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ uri, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      {uri ? <Image source={{ uri }} style={styles.avatar} /> : <View style={styles.avatar} />}
      <View style={styles.cameraButton}>
        <Icon name="camera" size={14} color={colors.white} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    height: 88,
    position: 'relative',
    width: 88,
  },
  avatar: {
    backgroundColor: colors.bgCardLight,
    borderColor: colors.greenBright,
    borderRadius: radii.full,
    borderWidth: 3,
    height: 88,
    width: 88,
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: colors.greenMid,
    borderColor: colors.bgPrimary,
    borderRadius: radii.full,
    borderWidth: 2,
    bottom: 0,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 26,
  },
});
