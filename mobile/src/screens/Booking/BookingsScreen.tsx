import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Badge, EmptyState } from '../../components';
import { useBookings } from '../../hooks/useItem';
import { Booking, BookingStatus } from '../../types';
import { TabScreenProps } from '../../navigation/types';
import { formatRange } from '../../utils/date';
import { formatMoney } from '../../utils/format';

const STATUS_META: Record<BookingStatus, { label: string; variant: 'primary' | 'success' | 'warning' | 'error' }> = {
  requested: { label: 'Requested', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'primary' },
  declined: { label: 'Declined', variant: 'error' },
  paid: { label: 'Paid', variant: 'primary' },
  active: { label: 'Active', variant: 'success' },
  returned: { label: 'Completed', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'error' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

export const BookingsScreen: React.FC<TabScreenProps<'Bookings'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<'borrower' | 'lender'>('borrower');
  const { bookings, loading, refreshing, refresh } = useBookings(role);

  const renderBooking = (booking: Booking) => {
    const meta = STATUS_META[booking.status];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('BookingDetail', { bookingId: booking.id })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.title} numberOfLines={2}>
            {booking.itemTitle}
          </Text>
          <Badge label={meta.label} variant={meta.variant} size="small" />
        </View>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={14} color={colors.neutral.textSecondary} />
          <Text style={styles.meta}>{formatRange(booking.startDate, booking.endDate)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="user" size={14} color={colors.neutral.textSecondary} />
          <Text style={styles.meta}>
            {role === 'borrower' ? `Lender: ${booking.lenderName}` : `Borrower: ${booking.borrowerName}`}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.total}>{formatMoney(booking.total)}</Text>
          <Text style={styles.totalNote}>incl. {formatMoney(booking.deposit)} deposit</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.segment}>
          {(['borrower', 'lender'] as const).map((r) => {
            const active = role === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {r === 'borrower' ? 'Borrowing' : 'Lending'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refresh}
          renderItem={({ item }) => renderBooking(item)}
          ListEmptyComponent={
            <EmptyState
              icon="package"
              title={role === 'borrower' ? 'No rentals yet' : 'Nothing lent out yet'}
              message={
                role === 'borrower'
                  ? 'Find something you need on the Home tab and request a booking.'
                  : 'Items you list will show their incoming requests here.'
              }
              actionLabel="Browse items"
              onAction={() => navigation.navigate('Home')}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  header: {
    backgroundColor: colors.neutral.surface,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: borders.width.thin,
    borderBottomColor: colors.neutral.border,
  },
  headerTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[3],
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.background,
    borderRadius: borders.radius.pill,
    padding: spacing[1],
  },
  segmentItem: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: 'center',
    borderRadius: borders.radius.pill,
  },
  segmentItemActive: { backgroundColor: colors.primary.main },
  segmentText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  segmentTextActive: { color: colors.primary.contrast },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[3] },
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
    marginBottom: spacing[2],
  },
  title: {
    flex: 1,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] },
  meta: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[2],
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  total: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.primary.main,
  },
  totalNote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
});
