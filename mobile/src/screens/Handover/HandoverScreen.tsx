import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Button, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Booking, EvidencePhoto, HandoverStatus, Payment } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { formatLong } from '../../utils/date';
import { formatMoney } from '../../utils/format';

export const HandoverScreen: React.FC<StackScreenProps<'Handover'>> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [handover, setHandover] = useState<HandoverStatus | null>(null);
  const [evidence, setEvidence] = useState<EvidencePhoto[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, h, ev, pay] = await Promise.all([
        api.getBooking(bookingId),
        api.getHandoverStatus(bookingId),
        api.listEvidence(bookingId),
        api.getPaymentsForBooking(bookingId),
      ]);
      setBooking(b);
      setHandover(h);
      setEvidence(ev);
      setPayments(pay);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn: () => Promise<unknown>, label: string) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      Alert.alert(label, e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !booking || !handover) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Handover" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  const isLender = booking.lenderId === CURRENT_USER.id;
  const before = evidence.find((e) => e.stage === 'before');
  const after = evidence.find((e) => e.stage === 'after');
  const rentalPaid = payments.some((p) => p.type === 'rental' && p.status === 'succeeded');
  const depositRefund = payments.find((p) => p.type === 'refund');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Handover" subtitle={booking.itemTitle} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Steps */}
        <View style={styles.card}>
          {[
            { key: 'before', label: 'Before photos', done: Boolean(before), by: before?.capturedBy },
            { key: 'pickup', label: 'Pickup confirmed', done: Boolean(booking.pickupConfirmedAt) },
            { key: 'rental', label: 'Rental in progress', done: booking.status !== 'accepted' && booking.status !== 'paid' },
            { key: 'after', label: 'After photos', done: Boolean(after) },
            { key: 'return', label: 'Return confirmed', done: Boolean(booking.returnConfirmedAt) },
            { key: 'deposit', label: 'Deposit released', done: Boolean(depositRefund) },
          ].map((step, i) => (
            <View key={step.key} style={styles.stepRow}>
              {i < 5 && <View style={[styles.rail, step.done && styles.railDone]} />}
              <View style={[styles.dot, step.done && styles.dotDone]}>
                {step.done && <Feather name="check" size={13} color={colors.primary.contrast} />}
              </View>
              <View style={styles.stepTextBlock}>
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
                {step.done && step.by ? <Text style={styles.stepBy}>by {step.by === CURRENT_USER.id ? 'you' : 'the other party'}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Evidence */}
        <Text style={styles.sectionTitle}>Photo evidence</Text>
        {evidence.length === 0 ? (
          <View style={styles.evidenceEmpty}>
            <Feather name="camera-off" size={16} color={colors.neutral.textMuted} />
            <Text style={styles.evidenceEmptyText}>No condition photos captured yet.</Text>
          </View>
        ) : (
          evidence.map((e) => (
            <View key={e.id} style={styles.evidenceItem}>
              <View style={styles.evidenceBadge}>
                <Text style={styles.evidenceBadgeText}>
                  {e.stage === 'before' ? 'Before' : 'After'}
                </Text>
              </View>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceTime}>{formatLong(e.capturedAt.slice(0, 10))}</Text>
                <Text style={styles.evidenceBy}>
                  by {e.capturedBy === CURRENT_USER.id ? 'you' : 'the other party'}
                </Text>
                {e.note ? <Text style={styles.evidenceNote}>"{e.note}"</Text> : null}
              </View>
              <Feather name="image" size={18} color={colors.primary.main} />
            </View>
          ))
        )}

        {/* Money status */}
        <View style={styles.card}>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Rental paid</Text>
            <Text style={[styles.moneyValue, rentalPaid && styles.moneyOk]}>
              {rentalPaid ? formatMoney(payments.find((p) => p.type === 'rental')!.amount) : 'Pending'}
            </Text>
          </View>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Deposit (held)</Text>
            <Text style={styles.moneyValue}>{handover.depositHeld ? formatMoney(handover.depositAmount) : '—'}</Text>
          </View>
          <View style={styles.moneyRow}>
            <Text style={styles.moneyLabel}>Deposit refund</Text>
            <Text style={[styles.moneyValue, depositRefund && styles.moneyOk]}>
              {depositRefund ? `Refunded ${formatMoney(depositRefund.amount)}` : 'Not yet'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Stage actions */}
      <View style={styles.bottomBar}>
        {handover.stage === 'pickup' && !isLender && (
          <>
            {booking.status === 'accepted' && (
              <Button title={`Pay ${formatMoney(booking.total)}`} onPress={() => navigation.replace('Payment', { bookingId })} />
            )}
            {!before && booking.status === 'paid' && (
              <Button title="Capture before photos" onPress={() => navigation.navigate('PhotoCapture', { bookingId, stage: 'before' })} />
            )}
            {before && booking.status === 'paid' && (
              <Button title="Confirm pickup" onPress={() => act(() => api.confirmPickup(bookingId), 'Pickup')} loading={busy} />
            )}
          </>
        )}

        {handover.stage === 'pickup' && isLender && (
          <View style={styles.waitBox}>
            <Feather name="clock" size={16} color={colors.primary.main} />
            <Text style={styles.waitText}>
              {booking.status === 'paid'
                ? 'Waiting for the borrower to confirm pickup.'
                : 'Waiting for the borrower to pay before pickup.'}
            </Text>
          </View>
        )}

        {handover.stage === 'return' && !isLender && (
          <>
            {!after ? (
              <Button title="Capture after photos" onPress={() => navigation.navigate('PhotoCapture', { bookingId, stage: 'after' })} />
            ) : (
              <Button title="Confirm return" onPress={() => act(() => api.confirmReturn(bookingId), 'Return')} loading={busy} />
            )}
          </>
        )}

        {handover.stage === 'return' && isLender && (
          <View style={styles.waitBox}>
            <Feather name="clock" size={16} color={colors.primary.main} />
            <Text style={styles.waitText}>
              Rental due back {formatLong(handover.endDate)}. Waiting on the borrower's return.
            </Text>
          </View>
        )}

        {handover.stage === 'release' && isLender && (
          <>
            {!depositRefund ? (
              <Button
                title={`Review & release ${formatMoney(handover.depositAmount)} deposit`}
                onPress={() => act(() => api.releaseDeposit(bookingId), 'Release')}
                loading={busy}
              />
            ) : (
              <View style={styles.waitBox}>
                <Feather name="check-circle" size={16} color={colors.accent.main} />
                <Text style={styles.waitText}>Deposit released to the borrower.</Text>
              </View>
            )}
          </>
        )}

        {handover.stage === 'release' && !isLender && (
          <View style={styles.waitBox}>
            <Feather name={depositRefund ? 'check-circle' : 'clock'} size={16} color={depositRefund ? colors.accent.main : colors.primary.main} />
            <Text style={styles.waitText}>
              {depositRefund
                ? `Your ${formatMoney(handover.depositAmount)} deposit has been refunded.`
                : 'Return confirmed. Waiting for the lender to release your deposit.'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.detailLink} onPress={() => navigation.goBack()}>
          <Text style={styles.detailLinkText}>Back to booking</Text>
        </TouchableOpacity>
      </View>
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
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  rail: {
    position: 'absolute',
    left: 15,
    top: 28,
    width: 2,
    height: 30,
    backgroundColor: colors.neutral.border,
  },
  railDone: { backgroundColor: colors.accent.main },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: borders.width.medium,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  dotDone: { backgroundColor: colors.accent.main, borderColor: colors.accent.main },
  stepTextBlock: { paddingTop: spacing[1], paddingBottom: spacing[4] },
  stepLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textMuted,
  },
  stepLabelDone: {
    fontFamily: typography.fonts.bodyBold,
    color: colors.neutral.textPrimary,
  },
  stepBy: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  evidenceEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.md,
  },
  evidenceEmptyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
  },
  evidenceBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borders.radius.pill,
    backgroundColor: colors.primary.main,
  },
  evidenceBadgeText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.contrast,
  },
  evidenceInfo: { flex: 1 },
  evidenceTime: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  evidenceBy: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  evidenceNote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing[1],
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
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
  bottomBar: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    gap: spacing[3],
  },
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
  detailLink: { alignItems: 'center', paddingVertical: spacing[1] },
  detailLinkText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
});