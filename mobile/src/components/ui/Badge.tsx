import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borders.radius.pill,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  success: {
    backgroundColor: colors.accent.main,
  },
  warning: {
    backgroundColor: colors.state.warning,
  },
  error: {
    backgroundColor: colors.state.error,
  },
  
  // Sizes
  small: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  medium: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  
  // Text
  text: {
    fontFamily: typography.fonts.bodyBold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.contrast,
  },
  successText: {
    color: colors.accent.contrast,
  },
  warningText: {
    color: colors.neutral.textPrimary,
  },
  errorText: {
    color: colors.primary.contrast,
  },
  smallText: {
    fontSize: typography.sizes.small,
  },
  mediumText: {
    fontSize: typography.sizes.caption,
  },
});
