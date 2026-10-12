import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Badge, Button, EmptyState, PriceSummary, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Booking, BookingStatus, Payment } from '../../types';
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, pays] = await Promise.all([
        api.getBooking(bookingId),
        api.getPaymentsForBooking(bookingId),
      ]);
      setBooking(b);
      setPayments(pays);
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

  const openChat = async () => {
    try {
      const conv = await api.ensureConversation(bookingId);
      navigation.navigate('Chat', { conversationId: conv.id });
    } catch {
      Alert.alert('Error', 'Could not open the conversation.');
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
  const rentalPayment = payments.find((p) => p.type === 'rental' && p.status === 'succeeded');
  const depositRefund = payments.find((p) => p.type === 'refund');

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

        {/* Dates + parties */}
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
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactButton} onPress={openChat}>
              <Feather name="message-circle" size={16} color={colors.primary.main} />
              <Text style={styles.contactText}>Message {isLender ? booking.borrowerName.split(' ')[0] : booking.lenderName.split(' ')[0]}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <PriceSummary price={price} pricePerDay={booking.rentalFee / price.days} />

        {/* Money status */}
        {booking.status !== 'requested' && booking.status !== 'declined' && booking.status !== 'cancelled' && (
          <View style={styles.card}>
            <View style={styles.moneyRow}>
              <Text style={styles.moneyLabel}>Rental payment</Text>
              <Text style={[styles.moneyValue, rentalPayment && styles.moneyOk]}>
                {rentalPayment ? `${formatMoney(rentalPayment.amount)} · ${rentalPayment.method.toUpperCase()}` : 'Pending'}
              </Text>
            </View>
            <View style={styles.moneyRow}>
              <Text style={styles.moneyLabel}>Deposit</Text>
              <Text style={styles.moneyValue}>{formatMoney(booking.deposit)} held</Text>
            </View>
            {depositRefund && (
              <View style={styles.moneyRow}>
                <Text style={styles.moneyLabel}>Deposit refund</Text>
                <Text style={[styles.moneyValue, styles.moneyOk]}>✓ {formatMoney(depositRefund.amount)} returned</Text>
              </View>
            )}
          </View>
        )}

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

            {!isLender && booking.status === 'accepted' && (
              <>
                <Button
                  title={`Pay ${formatMoney(booking.total)} (rental + deposit)`}
                  onPress={() => navigation.navigate('Payment', { bookingId })}
                />
                <View style={styles.gap} />
                <Button title="Cancel booking" variant="outline" onPress={() => mutate(api.cancelBooking)} />
              </>
            )}

            {isLender && booking.status === 'accepted' && (
              <View style={styles.waitBox}>
                <Feather name="clock" size={16} color={colors.primary.main} />
                <Text style={styles.waitText}>Waiting for the borrower to pay.</Text>
              </View>
            )}

            {booking.status === 'paid' && (
              <Button
                title={isLender ? 'View handover' : 'Capture photos & pickup'}
                onPress={() => navigation.navigate('Handover', { bookingId })}
                loading={busy}
              />
            )}

            {booking.status === 'active' && (
              <Button
                title={isLender ? 'View return progress' : 'Return the item'}
                onPress={() => navigation.navigate('Handover', { bookingId })}
              />
            )}
          </View>
        )}

        {booking.status === 'returned' && (
          <View style={styles.actions}>
            {!isLender && !depositRefund && (
              <View style={styles.waitBox}>
                <Feather name="clock" size={16} color={colors.accent.main} />
                <Text style={styles.waitText}>
                  Returned ✓ — {formatMoney(booking.deposit)} deposit refund pending lender release.
                </Text>
              </View>
            )}
            {isLender && !depositRefund && (
              <Button
                title="Release deposit"
                onPress={() => navigation.navigate('Handover', { bookingId })}
              />
            )}
            <Button title="Rate this rental" variant="outline" onPress={() => navigation.navigate('Reviews', { bookingId })} />
            <Button title="Report a problem" variant="outline" onPress={() => navigation.navigate('Disputes')} />
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
  contactRow: {
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    marginTop: spacing[2],
    paddingTop: spacing[3],
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  contactText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[1],
  },
  moneyLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  moneyValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  moneyOk: { color: colors.accent.main },
  actions: { gap: spacing[3] },
  gap: { height: spacing[1] },
  waitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: '#FFF4E6',
    borderRadius: borders.radius.md,
    padding: spacing[3],
  },
  waitText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
});