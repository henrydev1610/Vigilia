import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { designSystem } from '../../theme';
import { AppText } from '../ui';

export type SegmentTabKey = 'maiores' | 'economicos' | 'partidos';

interface SegmentTabsProps {
  selected: SegmentTabKey;
  onChange: (tab: SegmentTabKey) => void;
}

const TABS: Array<{ key: SegmentTabKey; label: string }> = [
  { key: 'maiores', label: 'Maiores' },
  { key: 'economicos', label: 'Econômicos' },
  { key: 'partidos', label: 'Partidos' },
];

const SegmentTabsComponent: React.FC<SegmentTabsProps> = ({ selected, onChange }) => {
  return (
    <View style={styles.wrapper}>
      {TABS.map((tab) => {
        const isActive = selected === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive ? styles.tabActive : null]}
          >
            <AppText weight="bold" style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
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
    backgroundColor: '#122D21',
    borderWidth: 1,
    borderColor: 'rgba(143, 233, 168, 0.12)',
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
  tabActive: {
    backgroundColor: designSystem.colors.green,
  },
  tabText: {
    fontSize: 13,
    lineHeight: 16,
    color: '#8FA89B',
  },
  tabTextActive: {
    color: '#0B2418',
  },
});
