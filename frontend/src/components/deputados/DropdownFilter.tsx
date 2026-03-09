import React, { memo, useEffect, useRef } from 'react';
import { Animated, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme, useDesignSystem } from '../../theme';
import { AppText } from '../ui';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFilterProps {
  visible: boolean;
  title: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const DropdownFilterComponent: React.FC<DropdownFilterProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const designSystem = useDesignSystem();
  const theme = useAppTheme();
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      panelTranslateY.setValue(24);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(panelTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 250,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, panelTranslateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { backgroundColor: theme.colors.overlay, opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: designSystem.colors.cardSecondary,
              borderColor: theme.colors.border,
              transform: [{ translateY: panelTranslateY }],
              ...designSystem.shadow.card,
            },
          ]}
        >
          <AppText weight="bold" style={[styles.title, { color: designSystem.colors.textPrimary }]}>
            {title}
          </AppText>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value || '__all__'}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.value === selectedValue;
              return (
                <Pressable style={styles.option} onPress={() => onSelect(item.value)}>
                  <AppText weight={selected ? 'bold' : 'regular'} style={[styles.optionLabel, { color: selected ? theme.colors.primaryStrong : designSystem.colors.textPrimary }]}>
                    {item.label}
                  </AppText>
                  {selected ? <Icon name="check" size={18} color={theme.colors.primary} /> : null}
                </Pressable>
              );
            }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

export const DropdownFilter = memo(DropdownFilterComponent);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    maxHeight: '62%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    marginBottom: 12,
  },
  option: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
});
