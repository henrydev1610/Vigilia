import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { Badge } from './Badge';
import { fallbackFonts, useAppTheme } from '../../theme';

interface ListItemProps {
  title: string;
  subtitle: string;
  badge?: string;
  amount?: string;
  imageUri?: string;
  onPress?: () => void;
  trailingIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightAction?: React.ReactNode;
}

const ListItemComponent: React.FC<ListItemProps> = ({
  title,
  subtitle,
  badge,
  amount,
  imageUri,
  onPress,
  trailingIcon,
  rightAction,
}) => {
  const theme = useAppTheme();
  const initials = title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.row}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={[styles.initials, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.bodyMedium }]}>
              {initials || '--'}
            </Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>{subtitle}</Text>
          {badge ? <Badge label={badge} tone="default" /> : null}
        </View>
        <View style={styles.trailing}>
          {amount ? <Text style={[styles.amount, { color: theme.colors.primary, fontFamily: fallbackFonts.heading }]}>{amount}</Text> : null}
          {rightAction ?? (trailingIcon ? <MaterialCommunityIcons name={trailingIcon} size={18} color={theme.colors.textMuted} /> : null)}
        </View>
      </Pressable>
    </Card>
  );
};

export const ListItem = React.memo(ListItemComponent);

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    backgroundColor: '#2A3B2C',
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#2A3B2C',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  initials: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 14,
  },
});

