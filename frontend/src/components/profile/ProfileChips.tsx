import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui';

interface ProfileChipsProps {
  items: string[];
}

const ProfileChipsComponent: React.FC<ProfileChipsProps> = ({ items }) => {
  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <AppText weight="medium" style={styles.text}>
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
    backgroundColor: '#1C3C2A',
    borderWidth: 1,
    borderColor: 'rgba(130, 181, 147, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#9BE7B2',
    fontSize: 12,
    lineHeight: 15,
  },
});
