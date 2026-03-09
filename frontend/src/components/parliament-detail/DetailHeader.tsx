import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

interface DetailHeaderProps {
  onBack: () => void;
  onShare: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ onBack, onShare }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.iconButton} hitSlop={10}>
        <Icon name="chevron-left" size={24} color={theme.colors.text} />
      </Pressable>

      <Text style={[styles.title, { color: theme.colors.text }]}>Detalhes do Parlamentar</Text>

      <Pressable onPress={onShare} style={styles.iconButton} hitSlop={10}>
        <Icon name="share-variant" size={20} color={theme.colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  iconButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
