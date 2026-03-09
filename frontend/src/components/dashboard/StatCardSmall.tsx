import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts, useAppTheme } from '../../theme';

interface StatCardSmallProps {
  title: string;
  line1: string;
  line1Tone?: 'default' | 'red';
  line2: string;
  line2Tone?: 'green' | 'red' | 'muted';
  showAlertIcon?: boolean;
}

export const StatCardSmall: React.FC<StatCardSmallProps> = ({
  title,
  line1,
  line1Tone = 'default',
  line2,
  line2Tone = 'muted',
  showAlertIcon,
}) => {
  const theme = useAppTheme();

  return (
    <LinearGradient colors={theme.gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { borderColor: theme.colors.border }]}> 
      <Text style={[styles.title, { color: theme.colors.textMuted, fontFamily: fallbackFonts.bodyMedium }]}>{title}</Text>
      <Text style={[styles.line1, { color: line1Tone === 'red' ? theme.colors.danger : theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>{line1}</Text>

      <View style={styles.line2Row}>
        <Text
          style={[
            styles.line2,
            {
              color:
                line2Tone === 'green'
                  ? theme.colors.success
                  : line2Tone === 'red'
                    ? theme.colors.danger
                    : theme.colors.textMuted,
              fontFamily: fallbackFonts.bodyMedium,
            },
          ]}
        >
          {line2}
        </Text>
        {showAlertIcon ? <Icon name="alert" size={13} color={theme.colors.danger} /> : null}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 110,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  line1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  line2Row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  line2: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
