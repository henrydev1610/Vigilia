import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { fallbackFonts } from '../../theme';

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
  return (
    <LinearGradient colors={['#142A20', '#121F19']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <Text style={[styles.title, { fontFamily: fallbackFonts.bodyMedium }]}>{title}</Text>
      <Text style={[styles.line1, line1Tone === 'red' ? styles.red : null, { fontFamily: fallbackFonts.headingBold }]}>{line1}</Text>

      <View style={styles.line2Row}>
        <Text
          style={[
            styles.line2,
            line2Tone === 'green' ? styles.green : null,
            line2Tone === 'red' ? styles.red : null,
            line2Tone === 'muted' ? styles.muted : null,
            { fontFamily: fallbackFonts.bodyMedium },
          ]}
        >
          {line2}
        </Text>
        {showAlertIcon ? <Icon name="alert" size={13} color="#FF6F69" /> : null}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    flex: 1,
    minHeight: 110,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    color: '#7A90A3',
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  line1: {
    color: '#EEF4EF',
    fontSize: 16,
    fontWeight:"bold",
    marginBottom: 6,
  },
  line2Row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  line2: {
    fontSize: 15,
    fontWeight:'bold'
  },
  green: {
    color: '#22D663',
  },
  red: {
    color: '#FF6F69',
  },
  muted: {
    color: '#6E8097',
  },
});
