import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={containerStyles}>
        <TextInput
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.neutral.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
  },
  label: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    color: colors.neutral.textSecondary,
    marginBottom: spacing[1],
  },
  container: {
    height: 48,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    borderRadius: borders.radius.md,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.neutral.surface,
  },
  focused: {
    borderColor: colors.primary.main,
    borderWidth: borders.width.medium,
  },
  error: {
    borderColor: colors.state.error,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.state.error,
    marginTop: spacing[1],
  },
  helperText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    marginTop: spacing[1],
  },
});
