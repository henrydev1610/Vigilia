import React, { memo, useRef } from 'react';
import { Image, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useUserProfileStore } from '../../store/userProfile.store';

interface HeaderProfileButtonProps {
  iconSize?: number;
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

function navigateToProfile(navigation: NavigationProp<Record<string, object | undefined>>) {
  let current: any = navigation;
  while (current) {
    const routeNames = current.getState?.()?.routeNames;
    if (Array.isArray(routeNames) && routeNames.includes('Profile')) {
      current.navigate('Profile');
      return;
    }
    current = current.getParent?.();
  }

  (navigation as any).navigate?.('Profile');
}

const HeaderProfileButtonComponent: React.FC<HeaderProfileButtonProps> = ({
  iconSize = 22,
  iconColor = '#95A7C0',
  containerStyle,
  onPress,
}) => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const avatarUri = useUserProfileStore((state) => state.avatarUri);
  const lastPressRef = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPressRef.current < 350) {
      return;
    }
    lastPressRef.current = now;

    if (onPress) {
      onPress();
      return;
    }
    navigateToProfile(navigation);
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Abrir perfil"
      style={({ pressed }) => [
        styles.button,
        containerStyle,
        pressed ? styles.pressed : null,
      ]}
    >
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
      ) : (
        <Icon name="account-circle-outline" size={iconSize} color={iconColor} />
      )}
    </Pressable>
  );
};

export const HeaderProfileButton = memo(HeaderProfileButtonComponent);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A5A47',
  },
});
