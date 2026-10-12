import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borders } from '../../theme';
import { Badge, EmptyState } from '../../components';
import { useBookings } from '../../hooks/useItem';
import { TabScreenProps } from '../../navigation/types';
import { formatLong } from '../../utils/date';

/**
 * Return & photo-evidence flow. The evidence capture itself lands in the next
 * milestone; for now this tab surfaces rentals that are due back.
 */
export const ReturnsScreen: React.FC<TabScreenProps<'Returns'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { bookings, loading } = useBookings('borrower');
  const dueBack = bookings.filter((b) => ['paid', 'active', 'returned'].includes(b.status));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <Text style={styles.headerTitle}>Returns</Text>
        <Text style={styles.headerSub}>Photo-verified handovers & deposits</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={dueBack}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
              >
                <View style={styles.cardHeaderInner}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.itemTitle}
                  </Text>
                  <Badge
                    label={
                      item.status === 'paid'
                        ? 'Pickup pending'
                        : item.status === 'returned'
                        ? 'Returned — deposit'
                        : 'Active'
                    }
                    variant={item.status === 'returned' ? 'success' : 'primary'}
                    size="small"
                  />
                </View>
              </TouchableOpacity>
              <View style={styles.metaRow}>
                <Feather name="calendar" size={14} color={colors.neutral.textSecondary} />
                <Text style={styles.meta}>
                  {item.status === 'returned' ? 'Awaiting deposit release' : `Return by ${formatLong(item.endDate)}`}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('Handover', { bookingId: item.id })}
                >
                  <Feather name="camera" size={14} color={colors.primary.main} />
                  <Text style={styles.actionText}>
                    {item.status === 'paid'
                      ? 'Capture before photos & pickup'
                      : item.status === 'active'
                      ? 'Capture after photos & return'
                      : 'View handover & deposit status'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="camera"
              title="Nothing to return"
              message="Active rentals appear here so you can capture condition photos at handover and return."
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
  },
  headerSub: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    marginTop: spacing[1],
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[3] },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  cardHeader: { marginBottom: spacing[2] },
  cardHeaderInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  title: {
    flex: 1,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  meta: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  actions: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  actionText: {
    flex: 1,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.main,
  },
});
