import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borders } from '../theme';
import { PriceBreakdown } from '../types';
import { formatMoney } from '../utils/format';

interface PriceSummaryProps {
  price: PriceBreakdown;
  pricePerDay: number;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ price, pricePerDay }) => (
  <View style={styles.container}>
    <Row
      label={`${formatMoney(pricePerDay)} × ${price.days} ${price.days === 1 ? 'day' : 'days'}`}
      value={formatMoney(price.rentalFee)}
    />
    <Row label="Rental fee" value={formatMoney(price.rentalFee)} />
    <Row label="Refundable deposit" value={formatMoney(price.deposit)} muted />

    <View style={styles.divider} />

    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total due now</Text>
      <Text style={styles.totalValue}>{formatMoney(price.total)}</Text>
    </View>

    <Text style={styles.note}>
      The {formatMoney(price.deposit)} deposit is held by CampusShare and refunded after the item is
      returned in its original condition.
    </Text>
  </View>
);

const Row: React.FC<{ label: string; value: string; muted?: boolean }> = ({
  label,
  value,
  muted,
}) => (
  <View style={styles.row}>
    <Text style={[styles.label, muted && styles.labelMuted]}>{label}</Text>
    <Text style={[styles.value, muted && styles.valueMuted]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  label: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  labelMuted: {
    color: colors.neutral.textPrimary,
  },
  value: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  valueMuted: {
    color: colors.neutral.textSecondary,
  },
  divider: {
    height: borders.width.thin,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing[2],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  totalValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h3,
    color: colors.primary.main,
  },
  note: {
    marginTop: spacing[3],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    lineHeight: typography.sizes.small * typography.lineHeights.normal,
  },
});
