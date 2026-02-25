import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type AuthCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f4f6f8',
    borderRadius: 18,
    paddingHorizontal: 30,
    paddingTop: 36,
    paddingBottom: 32,
    shadowColor: '#010302',
    shadowOpacity: 0.23,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 26,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#dfe5ea',
  },
  title: {
    color: '#232739',
    fontSize: 38,
    paddingBottom:20,
    lineHeight: 42,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    color: '#78869a',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '600',
  },
  content: {
    marginTop: 28,
    rowGap: 20,
  },
});
