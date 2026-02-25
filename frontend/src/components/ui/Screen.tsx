import React, { PropsWithChildren } from 'react';
import { StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';

interface ScreenProps extends PropsWithChildren {
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  includeBottomInset?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  padded = true,
  contentStyle,
  includeBottomInset = true,
}) => {
  const theme = useAppTheme();
  const safeAreaEdges = includeBottomInset ? (['top', 'bottom'] as const) : (['top'] as const);

  return (
    
    <SafeAreaView edges={safeAreaEdges} style={[styles.safe, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={theme.gradients.hero} style={StyleSheet.absoluteFillObject} />
      <View
        style={[
          styles.content,
          padded ? { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md } : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
});

