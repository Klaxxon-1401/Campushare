import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borders } from '../theme';

export interface ChipOption {
  key: string;
  label: string;
}

interface CategoryChipsProps {
  options: ChipOption[];
  selected: string;
  onSelect: (key: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ options, selected, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.container}
    contentContainerStyle={styles.content}
  >
    {options.map((option) => {
      const active = option.key === selected;
      return (
        <TouchableOpacity
          key={option.key}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onSelect(option.key)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    maxHeight: 44,
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borders.radius.pill,
    backgroundColor: colors.neutral.border,
  },
  chipActive: {
    backgroundColor: colors.primary.main,
  },
  label: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  labelActive: {
    color: colors.primary.contrast,
  },
});
