import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.primary.contrast : colors.primary.main}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borders.radius.md,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.neutral.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.primary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: borders.width.thin,
    borderColor: colors.primary.main,
  },
  
  // Sizes
  small: {
    height: 36,
    paddingHorizontal: spacing[3],
  },
  medium: {
    height: 44,
    paddingHorizontal: spacing[4],
  },
  large: {
    height: 48,
    paddingHorizontal: spacing[4],
    width: '100%',
  },
  
  // States
  disabled: {
    backgroundColor: colors.functional.disabled,
    borderColor: colors.functional.disabled,
  },
  
  // Text
  text: {
    fontFamily: typography.fonts.bodyBold,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.contrast,
  },
  secondaryText: {
    color: colors.primary.main,
  },
  outlineText: {
    color: colors.primary.main,
  },
  smallText: {
    fontSize: typography.sizes.body,
  },
  mediumText: {
    fontSize: typography.sizes.bodyLarge,
  },
  largeText: {
    fontSize: typography.sizes.bodyLarge,
  },
  disabledText: {
    color: colors.neutral.textMuted,
  },
});
