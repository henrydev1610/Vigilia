import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../ui';

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButtonComponent: React.FC<LogoutButtonProps> = ({ onPress }) => {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <View style={styles.iconWrap}>
        <Icon name="logout" size={18} color="#FFD5D5" />
      </View>
      <AppText weight="bold" style={styles.text}>
        Encerrar Sessão
      </AppText>
    </Pressable>
  );
};

export const LogoutButton = memo(LogoutButtonComponent);

const styles = StyleSheet.create({
  button: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#7E1C24',
    borderWidth: 1,
    borderColor: 'rgba(255, 163, 163, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFE6E6',
    fontSize: 16,
    lineHeight: 20,
  },
});
