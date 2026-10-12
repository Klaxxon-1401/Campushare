import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Button, PriceSummary, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { Booking, PaymentMethod } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { formatLong, formatRange } from '../../utils/date';
import { formatMoney } from '../../utils/format';

const METHODS: Array<{ key: PaymentMethod; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { key: 'upi', label: 'UPI', icon: 'smartphone' },
  { key: 'card', label: 'Card', icon: 'credit-card' },
  { key: 'wallet', label: 'Wallet', icon: 'disc' },
];

export const PaymentScreen: React.FC<StackScreenProps<'Payment'>> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBooking(await api.getBooking(bookingId));
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const price = useMemo(
    () =>
      booking
        ? {
            days: Math.round((Date.parse(booking.endDate) - Date.parse(booking.startDate)) / 86400000) + 1,
            rentalFee: booking.rentalFee,
            deposit: booking.deposit,
            total: booking.total,
          }
        : null,
    [booking]
  );

  const onPay = async () => {
    if (!booking) return;
    setProcessing(true);
    try {
      await api.payBookingAndCharge(bookingId, method);
      setDone(true);
    } catch (e) {
      Alert.alert('Payment failed', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Payment" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  if (!booking || !price) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Payment" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Booking not found.</Text>
        </View>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Payment" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <View style={styles.successCircle}>
            <Feather name="check" size={40} color={colors.accent.main} />
          </View>
          <Text style={styles.successTitle}>Payment successful</Text>
          <Text style={styles.successText}>
            {formatMoney(booking.total)} paid. The {formatMoney(booking.deposit)} deposit is held by
            CampusShare and refunded after a clean return.
          </Text>
          <View style={styles.successActions}>
            <Button
              title="Continue to handover"
              onPress={() => navigation.replace('Handover', { bookingId })}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Payment" subtitle={booking.itemTitle} onBack={() => navigation.goBack()} />

      <View style={styles.scroll}>
        <View style={styles.periodCard}>
          <View>
            <Text style={styles.periodLabel}>Rental period</Text>
            <Text style={styles.periodValue}>{formatRange(booking.startDate, booking.endDate)}</Text>
          </View>
          <Text style={styles.dueDate}>Due back {formatLong(booking.endDate)}</Text>
        </View>

        {price ? <PriceSummary price={price} pricePerDay={booking.rentalFee / price.days} /> : null}

        <Text style={styles.sectionTitle}>Pay with</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => {
            const active = method === m.key;
            return (
              <View key={m.key} style={[styles.method, active && styles.methodActive]}>
                <Feather
                  name={m.icon}
                  size={24}
                  color={active ? colors.primary.contrast : colors.neutral.textSecondary}
                />
                <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>{m.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.testMode}>
          <Feather name="info" size={14} color={colors.neutral.textSecondary} />
          <Text style={styles.testModeText}>
            Test payment — no real money moves. Stripe integration is scheduled for the next
            deployment milestone.
          </Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          title={`Pay ${formatMoney(booking.total)}`}
          onPress={onPay}
          loading={processing}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  emptyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  scroll: { flex: 1, padding: spacing[4], gap: spacing[4] },
  periodCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  periodLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  periodValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
    marginTop: spacing[1],
  },
  dueDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
    marginTop: spacing[2],
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  methods: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  method: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[4],
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surface,
  },
  methodActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  methodLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  methodLabelActive: { color: colors.primary.contrast },
  testMode: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: '#FFF8E6',
    borderRadius: borders.radius.md,
    padding: spacing[3],
  },
  testModeText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    lineHeight: typography.sizes.small * typography.lineHeights.normal,
  },
  bottomBar: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
  },
  successText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.body * typography.lineHeights.relaxed,
  },
  successActions: { marginTop: spacing[6], alignSelf: 'stretch' },
});