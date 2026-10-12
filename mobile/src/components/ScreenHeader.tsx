import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borders } from '../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Solid header used by stacked (non-tab) screens. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, right }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
      <View style={styles.side}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.primary.contrast} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  side: {
    width: 72,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.primary.contrast,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.primary.contrast,
    opacity: 0.85,
  },
});
