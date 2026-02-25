import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconTextInputProps = TextInputProps & {
  label: string;
  leftIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  error?: string | null;
};

export function IconTextInput({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  style,
  ...inputProps
}: IconTextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <MaterialCommunityIcons name={leftIcon} size={18} color="#95a1b0" style={styles.leftIcon} />
        <TextInput
          {...inputProps}
          placeholderTextColor="#9aa8b8"
          style={[styles.input, style]}
          autoCorrect={false}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            style={({ pressed }) => [styles.rightAction, pressed ? styles.rightPressed : null]}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name={rightIcon} size={21} color="#91a0b0" />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    rowGap: 10,
  },
  label: {
    color: '#566477',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1.1,
    lineHeight: 18,
  },
  inputWrap: {
    height: 60,
    borderRadius: 12,
    backgroundColor: '#edf1f5',
    borderWidth: 1,
    borderColor: '#edf1f5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputWrapError: {
    borderColor: '#d15252',
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#5a6779',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  rightAction: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 8,
  },
  rightPressed: {
    backgroundColor: '#dfe6ee',
  },
  error: {
    color: '#b64646',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
});
