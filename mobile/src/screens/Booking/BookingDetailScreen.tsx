import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Badge, Button, EmptyState, PriceSummary, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Booking, BookingStatus } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { formatLong, formatRange } from '../../utils/date';
import { formatMoney } from '../../utils/format';

const STATUS_META: Record<BookingStatus, { label: string; variant: 'primary' | 'success' | 'warning' | 'error' }> = {
  requested: { label: 'Requested', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'primary' },
  declined: { label: 'Declined', variant: 'error' },
  paid: { label: 'Paid', variant: 'primary' },
  active: { label: 'Active rental', variant: 'success' },
  returned: { label: 'Completed', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'error' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

const TIMELINE: BookingStatus[] = ['requested', 'accepted', 'paid', 'active', 'returned'];

export const BookingDetailScreen: React.FC<StackScreenProps<'BookingDetail'>> = ({
  navigation,
  route,
}) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

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

  const mutate = async (action: (id: string) => Promise<Booking>) => {
    setBusy(true);
    try {
      setBooking(await action(bookingId));
    } catch (e) {
      Alert.alert('Action failed', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Booking" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Booking" onBack={() => navigation.goBack()} />
        <EmptyState icon="alert-circle" title="Booking not found" actionLabel="Go back" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  const isLender = booking.lenderId === CURRENT_USER.id;
  const meta = STATUS_META[booking.status];
  const terminal = ['declined', 'cancelled', 'returned', 'disputed'].includes(booking.status);
  const currentStep = TIMELINE.indexOf(booking.status);

  const price = {
    days: Math.round((Date.parse(booking.endDate) - Date.parse(booking.startDate)) / 86400000) + 1,
    rentalFee: booking.rentalFee,
    deposit: booking.deposit,
    total: booking.total,
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Booking"
        subtitle={isLender ? 'You are the lender' : 'You are the borrower'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.itemTitle}>{booking.itemTitle}</Text>
            <Badge label={meta.label} variant={meta.variant} size="small" />
          </View>
          <Text style={styles.bookingId}>Booking #{booking.id}</Text>
        </View>

        {/* Timeline */}
        {!['declined', 'cancelled'].includes(booking.status) && (
          <View style={styles.card}>
            {TIMELINE.map((step, i) => {
              const done = currentStep >= i;
              const active = currentStep === i;
              return (
                <View key={step} style={styles.step}>
                  <View style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                    {done && <Feather name="check" size={12} color={colors.primary.contrast} />}
                  </View>
                  {i < TIMELINE.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}
                  <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>
                    {STATUS_META[step].label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Dates */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.fieldLabel}>Pickup</Text>
              <Text style={styles.fieldValue}>{formatLong(booking.startDate)}</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.neutral.textMuted} />
            <View style={styles.alignEnd}>
              <Text style={styles.fieldLabel}>Return</Text>
              <Text style={styles.fieldValue}>{formatLong(booking.endDate)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.fieldLabel}>Period</Text>
            <Text style={styles.fieldValue}>{formatRange(booking.startDate, booking.endDate)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.fieldLabel}>{isLender ? 'Borrower' : 'Lender'}</Text>
            <Text style={styles.fieldValue}>{isLender ? booking.borrowerName : booking.lenderName}</Text>
          </View>
        </View>

        <PriceSummary price={price} pricePerDay={booking.rentalFee / price.days} />

        {/* Actions */}
        {!terminal && (
          <View style={styles.actions}>
            {isLender && booking.status === 'requested' && (
              <>
                <Button title="Accept request" onPress={() => mutate(api.acceptBooking)} loading={busy} />
                <View style={styles.gap} />
                <Button title="Decline" variant="outline" onPress={() => mutate(api.declineBooking)} />
              </>
            )}

            {!isLender && booking.status === 'requested' && (
              <Button title="Cancel request" variant="outline" onPress={() => mutate(api.cancelBooking)} />
            )}

            {booking.status === 'accepted' && (
              <>
                <Button
                  title="Pay rental + deposit"
                  onPress={() => mutate(api.payBooking)}
                  loading={busy}
                />
                <View style={styles.gap} />
                <Button title="Cancel booking" variant="outline" onPress={() => mutate(api.cancelBooking)} />
                <Text style={styles.devNote}>Test mode — no real payment is taken yet.</Text>
              </>
            )}

            {booking.status === 'paid' && (
              <View style={styles.infoBox}>
                <Feather name="camera" size={16} color={colors.primary.main} />
                <Text style={styles.infoText}>
                  Once you meet on campus, capture “before” condition photos to start the rental.
                  (Photo capture arrives in the next milestone.)
                </Text>
              </View>
            )}

            {booking.status === 'active' && (
              <View style={styles.infoBox}>
                <Feather name="clock" size={16} color={colors.primary.main} />
                <Text style={styles.infoText}>
                  Rental in progress. Return on {formatLong(booking.endDate)} and capture “after”
                  photos to release the deposit.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8], gap: spacing[4] },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  itemTitle: {
    flex: 1,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  bookingId: {
    marginTop: spacing[1],
    fontFamily: typography.fonts.utility,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[1] },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: borders.width.medium,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
  },
  dotDone: { backgroundColor: colors.accent.main, borderColor: colors.accent.main },
  dotActive: { borderColor: colors.accent.main },
  line: {
    position: 'absolute',
    left: 10,
    top: 22,
    width: 2,
    height: spacing[4],
    backgroundColor: colors.neutral.border,
  },
  lineDone: { backgroundColor: colors.accent.main },
  stepLabel: {
    marginLeft: spacing[3],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textMuted,
  },
  stepLabelDone: { color: colors.neutral.textPrimary, fontFamily: typography.fonts.bodyBold },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  alignEnd: { alignItems: 'flex-end' },
  fieldLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  fieldValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  divider: {
    height: borders.width.thin,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing[3],
  },
  actions: { gap: spacing[3] },
  gap: { height: spacing[1] },
  devNote: {
    textAlign: 'center',
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: '#FFF4E6',
    borderRadius: borders.radius.md,
    padding: spacing[3],
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
    lineHeight: typography.sizes.body * typography.lineHeights.normal,
  },
});
