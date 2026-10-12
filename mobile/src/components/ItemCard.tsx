import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, typography, spacing, borders } from '../theme';
import { Item } from '../types';
import { categoryLabel, CATEGORY_EMOJI, formatMoney } from '../utils/format';
import { Badge } from './ui';

interface ItemCardProps {
  item: Item;
  onPress: () => void;
  style?: ViewStyle;
}

/** Grid tile used on the home feed and search results. */
export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress, style }) => (
  <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.image}>
      <Text style={styles.imageEmoji}>{CATEGORY_EMOJI[item.category]}</Text>
      <Badge label={categoryLabel(item.category)} variant="primary" size="small" style={styles.badge} />
      {item.status === 'draft' && (
        <Badge label="Draft" variant="warning" size="small" style={styles.draftBadge} />
      )}
    </View>

    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.locationRow}>
        <Text style={styles.pin}>📍</Text>
        <Text style={styles.location} numberOfLines={1}>
          {item.location}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>{formatMoney(item.pricePerDay)}</Text>
          <Text style={styles.perDay}>/day</Text>
        </View>
        <View style={styles.depositBlock}>
          <Text style={styles.depositLabel}>Deposit</Text>
          <Text style={styles.depositValue}>{formatMoney(item.deposit)}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  image: {
    height: 112,
    backgroundColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: {
    fontSize: 40,
  },
  badge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
  },
  draftBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
  },
  content: {
    padding: spacing[3],
  },
  title: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[1],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  pin: {
    fontSize: typography.sizes.small,
    marginRight: spacing[1],
  },
  location: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing[2],
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.primary.main,
  },
  perDay: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  depositBlock: {
    alignItems: 'flex-end',
  },
  depositLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  depositValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
});
