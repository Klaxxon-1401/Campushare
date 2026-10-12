import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Button, EmptyState, Input, ScreenHeader } from '../../components';
import { api, ApiError } from '../../services/api';
import { Booking, Dispute, User, VerificationStatus } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { formatMoney, initials } from '../../utils/format';
import { formatShort } from '../../utils/date';

type Analytics = Awaited<ReturnType<typeof api.getAnalytics>>;

const BOOKING_STATUS_ORDER: Booking['status'][] = [
  'requested',
  'accepted',
  'paid',
  'active',
  'returned',
  'disputed',
  'declined',
  'cancelled',
];

/** Client-side admin console: verification queue, disputes and analytics. */
export const AdminScreen: React.FC<StackScreenProps<'Admin'>> = ({ navigation }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resolvingId, setResolvingId] = useState('');
  const [resolution, setResolution] = useState('');

  const load = useCallback(async () => {
    try {
      const [a, u, d] = await Promise.all([
        api.getAnalytics(),
        api.listUsers(),
        api.listDisputes(),
      ]);
      setAnalytics(a);
      setUsers(u);
      setDisputes(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pending = users.filter((u) => u.verificationStatus === 'pending');
  const openDisputes = disputes.filter((d) => d.status !== 'resolved');

  const decide = async (userId: string, status: VerificationStatus) => {
    setBusy(true);
    try {
      await api.setUserVerification(userId, status);
      await load();
    } catch (e) {
      Alert.alert('Could not update', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resolve = async (disputeId: string) => {
    if (!resolution.trim()) {
      Alert.alert('Add a resolution', 'Describe how the case was settled for the audit log.');
      return;
    }
    setBusy(true);
    try {
      await api.resolveDispute(disputeId, resolution.trim());
      setResolvingId('');
      setResolution('');
      await load();
    } catch (e) {
      Alert.alert('Could not resolve', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !analytics) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Admin" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  const stats: Array<{ icon: keyof typeof Feather.glyphMap; label: string; value: string }> = [
    { icon: 'package', label: 'Items listed', value: String(analytics.items.total) },
    { icon: 'activity', label: 'Active rentals', value: String(analytics.bookings.active ?? 0) },
    { icon: 'trending-up', label: 'Rental revenue', value: formatMoney(analytics.revenue) },
    { icon: 'lock', label: 'Deposits held', value: formatMoney(analytics.depositsHeld) },
    { icon: 'shield', label: 'Open disputes', value: String(analytics.openDisputes) },
    { icon: 'user-check', label: 'Pending KYC', value: String(analytics.users.pending) },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Admin dashboard"
        subtitle={`${analytics.users.total} users · ${analytics.items.total} items`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Feather name={s.icon} size={18} color={colors.primary.main} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bookings by status</Text>
          <View style={styles.chips}>
            {BOOKING_STATUS_ORDER.map((status) => (
              <View key={status} style={styles.chip}>
                <Text style={styles.chipCount}>{analytics.bookings[status] ?? 0}</Text>
                <Text style={styles.chipLabel}>{status}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Verification queue</Text>
        {pending.length === 0 ? (
          <View style={styles.note}>
            <Feather name="check-circle" size={14} color={colors.accent.main} />
            <Text style={styles.noteText}>No students are awaiting verification.</Text>
          </View>
        ) : (
          pending.map((u) => (
            <View key={u.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(u.name)}</Text>
                  </View>
                  <View>
                    <Text style={styles.title}>{u.name}</Text>
                    <Text style={styles.subtle}>{u.campusEmail}</Text>
                    {u.studentId ? <Text style={styles.subtle}>ID {u.studentId}</Text> : null}
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: colors.state.warning + '22' }]}>
                  <Text style={[styles.statusText, { color: colors.state.warning }]}>pending</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <View style={styles.actionBtn}>
                  <Button
                    title="Approve"
                    size="small"
                    onPress={() => decide(u.id, 'verified')}
                    disabled={busy}
                  />
                </View>
                <View style={styles.actionBtn}>
                  <Button
                    title="Reject"
                    size="small"
                    variant="secondary"
                    onPress={() => decide(u.id, 'rejected')}
                    disabled={busy}
                  />
                </View>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Dispute queue</Text>
        {openDisputes.length === 0 ? (
          <EmptyState
            icon="shield"
            title="No open disputes"
            message="Cases filed by borrowers or lenders appear here for review against the photo evidence."
          />
        ) : (
          openDisputes.map((d) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.title} numberOfLines={1}>{d.itemTitle}</Text>
                <Text style={styles.subtle}>{formatShort(d.createdAt.slice(0, 10))}</Text>
              </View>
              <Text style={styles.chipLabel}>
                {d.reason.replace('-', ' ')} · filed by {d.filedByName}
              </Text>
              <Text style={styles.body}>{d.description}</Text>

              {resolvingId === d.id ? (
                <View style={styles.resolveBox}>
                  <Input
                    label="Resolution"
                    value={resolution}
                    onChangeText={setResolution}
                    multiline
                    numberOfLines={2}
                    placeholder="e.g. Deposit released in full; no damage found."
                  />
                  <Button
                    title="Confirm resolution"
                    onPress={() => resolve(d.id)}
                    loading={busy}
                  />
                  <TouchableOpacity
                    style={styles.cancelRow}
                    onPress={() => {
                      setResolvingId('');
                      setResolution('');
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  title="Resolve"
                  size="small"
                  onPress={() => {
                    setResolvingId(d.id);
                    setResolution('');
                  }}
                />
              )}
            </View>
          ))
        )}

        <View style={styles.note}>
          <Feather name="info" size={14} color={colors.state.info} />
          <Text style={styles.noteText}>
            Demo console — actions apply to this session only. Server-side role enforcement arrives
            with the Firebase auth milestone (PROJECT_PLAN §16.1).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8], gap: spacing[3] },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
    marginTop: spacing[2],
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  statCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
    gap: spacing[1],
  },
  statValue: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  cardTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borders.radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minWidth: 68,
  },
  chipCount: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  chipLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    textTransform: 'capitalize',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
  title: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  subtle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  body: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  statusPill: { paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: borders.radius.pill },
  statusText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    textTransform: 'capitalize',
  },
  actions: { flexDirection: 'row', gap: spacing[3] },
  actionBtn: { flex: 1 },
  resolveBox: { gap: spacing[3] },
  cancelRow: { alignItems: 'center' },
  cancelText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  note: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: '#EAF2FB',
    borderRadius: borders.radius.md,
    padding: spacing[3],
  },
  noteText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
});
