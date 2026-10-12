import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Button, EmptyState, Input, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Booking, Review } from '../../types';
import { StackScreenProps } from '../../navigation/types';

interface PendingReview {
  booking: Booking;
  reviewed: boolean;
}

const StarRow: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map((s) => (
      <TouchableOpacity key={s} onPress={() => onChange(s)} hitSlop={8}>
        <Feather name={value >= s ? 'star' : 'star'} size={30} color={value >= s ? colors.state.warning : colors.neutral.border} />
      </TouchableOpacity>
    ))}
  </View>
);

export const ReviewsScreen: React.FC<StackScreenProps<'Reviews'>> = ({ navigation, route }) => {
  const ratingBookingId = route.params?.bookingId;
  const [pending, setPending] = useState<PendingReview[]>([]);
  const [received, setReceived] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [given, allBookings, receivedReviews] = await Promise.all([
        api.listReviews({ fromUserId: CURRENT_USER.id }),
        fetchAllBookings(),
        api.listReviews({ toUserId: CURRENT_USER.id }),
      ]);
      const completed = allBookings.filter(
        (b) =>
          b.status === 'returned' &&
          [b.lenderId, b.borrowerId].includes(CURRENT_USER.id)
      );
      setPending(
        completed.map((b) => ({
          booking: b,
          reviewed: given.some((r) => r.bookingId === b.id),
        }))
      );
      setReceived(receivedReviews);
    } finally {
      setLoading(false);
    }
  }, []);

  // Local store only exposes a borrower-scoped list; derive party-scoped
  // "returned" bookings from the lend + borrow lists.
  const fetchAllBookings = useCallback(async (): Promise<Booking[]> => {
    const [borrowed, lent] = await Promise.all([
      api.listBookings({ role: 'borrower' }),
      api.listBookings({ role: 'lender' }),
    ]);
    const seen = new Map<string, Booking>();
    [...borrowed, ...lent].forEach((b) => seen.set(b.id, b));
    return Array.from(seen.values());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (bookingId: string) => {
    if (rating < 1) {
      Alert.alert('Rating required', 'Tap a star to rate the other party.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createReview(bookingId, rating, comment);
      setRating(0);
      setComment('');
      await load();
      Alert.alert('Review submitted', 'Thanks for helping the campus community!');
    } catch (e) {
      Alert.alert('Could not submit review', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Reviews" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  // Direct rating mode (from BookingDetail "Rate this rental")
  if (ratingBookingId) {
    const target = pending.find((p) => p.booking.id === ratingBookingId);
    const othersName = target
      ? target.booking.lenderId === CURRENT_USER.id
        ? target.booking.borrowerName
        : target.booking.lenderName
      : 'them';
    return (
      <View style={styles.container}>
        <ScreenHeader title="Rate this rental" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
          {!target ? (
            <EmptyState
              icon="star"
              title="Nothing to rate yet"
              message="This rental needs to be completed before it can be reviewed."
              actionLabel="Go back"
              onAction={() => navigation.goBack()}
            />
          ) : target.reviewed ? (
            <EmptyState
              icon="check-circle"
              title="Already reviewed"
              message="You have already submitted a review for this rental."
              actionLabel="Go back"
              onAction={() => navigation.goBack()}
            />
          ) : (
            <>
              <Text style={styles.ask}>How was your rental with {othersName}?</Text>
              <StarRow value={rating} onChange={setRating} />
              <Input
                label="Review (optional)"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                maxLength={300}
                placeholder="Friendly, on-time, accurate condition description…"
              />
              <Button title="Submit review" onPress={() => submit(target.booking.id)} loading={submitting} />
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Reviews" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Rentals to review</Text>
        {pending.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="All caught up"
            message="Reviews unlock after completed rentals."
          />
        ) : (
          pending.map((p) => {
            const other = p.booking.lenderId === CURRENT_USER.id ? p.booking.borrowerName : p.booking.lenderName;
            return (
              <View key={p.booking.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.title} numberOfLines={1}>{p.booking.itemTitle}</Text>
                  {p.reviewed && (
                    <View style={styles.doneTagWrap}>
                      <Feather name="check" size={12} color={colors.accent.main} />
                      <Text style={styles.doneTag}>Reviewed</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sub}>with {other}</Text>
                {!p.reviewed && (
                  <Button
                    title="Write review"
                    variant="outline"
                    size="small"
                    style={styles.reviewBtn}
                    onPress={() => navigation.navigate('Reviews', { bookingId: p.booking.id })}
                  />
                )}
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Reviews about you</Text>
        {received.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.sub}>No reviews yet — they appear once others complete rentals with you.</Text>
          </View>
        ) : (
          received.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Feather key={s} name="star" size={14} color={s <= r.rating ? colors.state.warning : colors.neutral.border} />
                  ))}
                </View>
                <Text style={styles.sub}>{r.fromUserName}</Text>
              </View>
              {r.comment ? <Text style={styles.comment}>"{r.comment}"</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8], gap: spacing[3] },
  formScroll: { padding: spacing[4], paddingBottom: spacing[8], gap: spacing[4] },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
    marginTop: spacing[2],
  },
  ask: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
    textAlign: 'center',
  },
  stars: { flexDirection: 'row', gap: spacing[2], justifyContent: 'center', marginVertical: spacing[2] },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
    gap: spacing[1],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  title: {
    flex: 1,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  sub: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  doneTagWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  doneTag: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.accent.main,
  },
  reviewBtn: { marginTop: spacing[3] },
  starsRow: { flexDirection: 'row', gap: 2 },
  comment: {
    marginTop: spacing[2],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
    fontStyle: 'italic',
  },
});