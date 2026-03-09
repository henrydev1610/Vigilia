import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../../theme';
import { AppText } from '../ui';

export type SegmentTabKey = 'maiores' | 'economicos' | 'partidos';

interface SegmentTabsProps {
  selected: SegmentTabKey;
  onChange: (tab: SegmentTabKey) => void;
}

const TABS: Array<{ key: SegmentTabKey; label: string }> = [
  { key: 'maiores', label: 'Maiores' },
  { key: 'economicos', label: 'Economicos' },
  { key: 'partidos', label: 'Partidos' },
];

const SegmentTabsComponent: React.FC<SegmentTabsProps> = ({ selected, onChange }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border }]}> 
      {TABS.map((tab) => {
        const isActive = selected === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive ? { backgroundColor: theme.colors.primary } : null]}
          >
            <AppText weight="bold" style={[styles.tabText, { color: isActive ? theme.colors.textInverse : theme.colors.textMuted }]}> 
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

export const SegmentTabs = memo(SegmentTabsComponent);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 13,
    lineHeight: 16,
  },
});
