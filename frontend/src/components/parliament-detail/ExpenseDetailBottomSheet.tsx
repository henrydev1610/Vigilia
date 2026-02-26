import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface ExpenseSheetData {
  valueLabel: string;
  title: string;
  pdfUrl: string | null;
}

interface ExpenseDetailBottomSheetProps {
  visible: boolean;
  expense: ExpenseSheetData | null;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const ExpenseDetailBottomSheet: React.FC<ExpenseDetailBottomSheetProps> = ({
  visible,
  expense,
  onClose,
  onDownloadPdf,
}) => {
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(260)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          duration: 220,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          damping: 18,
          mass: 0.9,
          stiffness: 185,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 180,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        duration: 180,
        toValue: 260,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
  }, [opacity, translateY, visible]);

  const shareDisabled = useMemo(() => !expense, [expense]);

  async function handleShare() {
    if (!expense) return;
    if (expense.pdfUrl) {
      await Share.share({ message: expense.pdfUrl, url: expense.pdfUrl });
      return;
    }
    await Share.share({ message: `${expense.title} - ${expense.valueLabel}` });
  }

  if (!mounted) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.grabber} />
          <Text style={styles.value}>{expense?.valueLabel ?? 'R$ 0,00'}</Text>
          <Text numberOfLines={2} style={styles.title}>
            {expense?.title ?? 'Despesa'}
          </Text>

          <View style={styles.actionsRow}>
            <Pressable disabled={shareDisabled} onPress={handleShare} style={styles.action}>
              <Icon name="share-variant-outline" size={18} color="#DDF2E6" />
              <Text style={styles.actionLabel}>Compartilhar</Text>
            </Pressable>

            <Pressable onPress={onDownloadPdf} style={styles.action}>
              <Icon name="download-box-outline" size={18} color="#DDF2E6" />
              <Text style={styles.actionLabel}>Baixar PDF</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(3, 10, 7, 0.62)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    width: '100%',
  },
  sheet: {
    backgroundColor: '#0F2519',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 7,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: '#3E5F4D',
    borderRadius: 99,
    height: 4,
    marginBottom: 12,
    width: 42,
  },
  value: {
    color: '#1FE16C',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.6,
    lineHeight: 36,
    textAlign: 'center',
  },
  title: {
    color: '#E7F6ED',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  action: {
    alignItems: 'center',
    backgroundColor: '#123322',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionLabel: {
    color: '#DDF2E6',
    fontSize: 14,
    fontWeight: '700',
  },
});
