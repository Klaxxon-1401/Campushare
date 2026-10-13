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
          <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  // Size the row to its chips and never let sibling flex views shrink it.
  // ScrollView defaults to flexGrow: 1 / flexShrink: 1 — the default shrink is
  // what clipped the pills, and a hard max-height cropped labels when the font
  // scaled up. Letting the content define the height fixes both.
  container: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    gap: spacing[2],
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borders.radius.pill,
    backgroundColor: colors.neutral.border,
    flexShrink: 0,
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
