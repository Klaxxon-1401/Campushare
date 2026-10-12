import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import {
  AvailabilityCalendar,
  Button,
  PriceSummary,
  ScreenHeader,
} from '../../components';
import { useItem } from '../../hooks/useItem';
import { api, ApiError } from '../../services/api';
import { AvailabilityState } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { addDays, eachDay, formatLong, todayISO } from '../../utils/date';
import { computePrice } from '../../utils/pricing';

export const BookingRequestScreen: React.FC<StackScreenProps<'BookingRequest'>> = ({
  navigation,
  route,
}) => {
  const { itemId } = route.params;
  const { item, loading } = useItem(itemId);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [availability, setAvailability] = useState<Record<string, AvailabilityState>>({});
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAvailability = useCallback(async () => {
    const days = await api.getAvailability(itemId, year, month);
    setAvailability((prev) => ({
      ...prev,
      ...Object.fromEntries(days.map((d) => [d.date, d.state])),
    }));
  }, [itemId, year, month]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const price = useMemo(
    () =>
      start && end && item ? computePrice(item.pricePerDay, item.deposit, start, end) : null,
    [start, end, item]
  );

  // Any day in the chosen range that is already reserved/blocked invalidates it.
  const rangeConflict = useMemo(() => {
    if (!start || !end) return false;
    return eachDay(start, end).some((d) => (availability[d] ?? 'open') !== 'open');
  }, [start, end, availability]);

  const onSelectDate = (iso: string) => {
    if (!start || (start && end)) {
      setStart(iso);
      setEnd(null);
      return;
    }
    if (iso < start) {
      setStart(iso);
      return;
    }
    setEnd(iso);
  };

  const onRequest = async () => {
    if (!start || !end) return;
    setSubmitting(true);
    try {
      const booking = await api.createBooking({ itemId, startDate: start, endDate: end });
      navigation.replace('BookingDetail', { bookingId: booking.id });
    } catch (e) {
      Alert.alert(
        'Could not create booking',
        e instanceof ApiError ? e.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !item) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Request Booking" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  const canSubmit = Boolean(start) && !submitting;
  const endMax = start ? addDays(start, 29) : undefined;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Request Booking" subtitle={item.title} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.instruction}>
          {!start
            ? 'Pick your pickup date.'
            : !end
            ? 'Now pick your return date.'
            : 'Review your rental period below.'}
        </Text>

        <AvailabilityCalendar
          year={year}
          month={month}
          availability={availability}
          onChangeMonth={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
          onSelectDate={onSelectDate}
          selectionStart={start}
          selectionEnd={end}
          minDate={todayISO()}
        />

        {start && (
          <View style={styles.rangeCard}>
            <View style={styles.rangeCol}>
              <Text style={styles.rangeLabel}>Pickup</Text>
              <Text style={styles.rangeValue}>{formatLong(start)}</Text>
            </View>
            <View style={styles.rangeDivider} />
            <View style={styles.rangeCol}>
              <Text style={styles.rangeLabel}>Return</Text>
              <Text style={styles.rangeValue}>{end ? formatLong(end) : '—'}</Text>
            </View>
          </View>
        )}

        {rangeConflict && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Some dates in this range are already booked. Please choose a different period.
            </Text>
          </View>
        )}

        {endMax && (
          <Text style={styles.hint}>Maximum rental period is 30 days.</Text>
        )}

        {price && !rangeConflict ? <PriceSummary price={price} pricePerDay={item.pricePerDay} /> : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={end ? `Request — ${price ? `$${price.total}` : ''}` : 'Select dates'}
          onPress={onRequest}
          disabled={!canSubmit || rangeConflict}
          loading={submitting}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8], gap: spacing[4] },
  instruction: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  rangeCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  rangeCol: { flex: 1 },
  rangeDivider: {
    width: borders.width.thin,
    backgroundColor: colors.neutral.border,
    marginHorizontal: spacing[3],
  },
  rangeLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  rangeValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  warning: {
    backgroundColor: '#FDEDEC',
    borderRadius: borders.radius.md,
    padding: spacing[3],
  },
  warningText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.state.error,
  },
  hint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  bottomBar: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
});
