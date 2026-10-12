import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  editable?: boolean;
  autoFocus?: boolean;
  /** When set, the bar acts as a button (e.g. to open the search screen). */
  onPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search items…',
  editable = true,
  autoFocus = false,
  onPress,
}) => {
  const inner = (
    <>
      <Feather name="search" size={18} color={colors.neutral.textSecondary} />
      {onPress ? (
        <Text style={[styles.input, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.textMuted}
          editable={editable}
          autoFocus={autoFocus}
          returnKeyType="search"
        />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={styles.container}>{inner}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[3],
    height: 46,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
  },
  input: {
    flex: 1,
    marginLeft: spacing[2],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  placeholder: {
    color: colors.neutral.textMuted,
  },
});
