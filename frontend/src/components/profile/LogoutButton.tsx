import React, { memo } from 'react';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButtonComponent: React.FC<LogoutButtonProps> = ({ onPress }) => {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} style={[styles.button, { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.danger }]}> 
      <View style={styles.iconWrap}>
        <Icon name="logout" size={18} color={theme.colors.danger} />
      </View>
      <AppText weight="bold" style={[styles.text, { color: theme.colors.danger }]}> 
        Encerrar Sessao
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
    borderWidth: 1,
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
    fontSize: 16,
    lineHeight: 20,
  },
});
