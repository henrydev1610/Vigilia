import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View } from 'react-native';
import { fallbackFonts, useAppTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({ label, error, inputStyle, ...rest }) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { marginBottom: theme.spacing.md }]}> 
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.size.label,
              lineHeight: theme.typography.lineHeight.label,
              fontFamily: fallbackFonts.bodyMedium,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        {...rest}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            color: theme.colors.text,
            fontSize: theme.typography.size.body,
            lineHeight: theme.typography.lineHeight.body,
            fontFamily: fallbackFonts.body,
            minHeight: 48,
            paddingHorizontal: theme.spacing.md,
          },
          inputStyle,
        ]}
      />
      {error ? (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.danger,
              fontSize: theme.typography.size.caption,
              lineHeight: theme.typography.lineHeight.caption,
              fontFamily: fallbackFonts.body,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
  },
  error: {
    marginTop: 6,
  },
});

