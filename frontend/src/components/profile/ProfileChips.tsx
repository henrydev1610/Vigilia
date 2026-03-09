import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

interface ProfileChipsProps {
  items: string[];
}

const ProfileChipsComponent: React.FC<ProfileChipsProps> = ({ items }) => {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item} style={[styles.chip, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border }]}> 
          <AppText weight="medium" style={[styles.text, { color: theme.colors.primaryStrong }]}> 
            {item}
          </AppText>
        </View>
      ))}
    </View>
  );
};

export const ProfileChips = memo(ProfileChipsComponent);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    lineHeight: 15,
  },
});
