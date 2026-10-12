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
import { Booking, Dispute, DisputeReason } from '../../types';
import { StackScreenProps } from '../../navigation/types';

const REASONS: Array<{ key: DisputeReason; label: string; desc: string }> = [
  { key: 'damage', label: 'Damaged item', desc: 'Condition differs from the photos' },
  { key: 'returned-late', label: 'Returned late', desc: 'Item returned after the end date' },
  { key: 'not-returned', label: 'Not returned', desc: 'The item has not come back' },
  { key: 'other', label: 'Something else', desc: 'Describe the problem below' },
];

const STATUS_COLOR: Record<Dispute['status'], string> = {
  open: colors.state.warning,
  'under-review': colors.state.info,
  resolved: colors.accent.main,
};

export const DisputesScreen: React.FC<StackScreenProps<'Disputes'>> = ({ navigation }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [completed, setCompleted] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filing, setFiling] = useState(false);

  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [reason, setReason] = useState<DisputeReason>('damage');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, borrowed, lent] = await Promise.all([
        api.listDisputes({ userId: CURRENT_USER.id }),
        api.listBookings({ role: 'borrower' }),
        api.listBookings({ role: 'lender' }),
      ]);
      setDisputes(mine);
      const seen = new Map<string, Booking>();
      [...borrowed, ...lent].forEach((b) => seen.set(b.id, b));
      setCompleted(
        Array.from(seen.values()).filter(
          (b) =>
            (b.status === 'returned' || b.status === 'active' || b.status === 'paid') &&
            !mine.some((d) => d.bookingId === b.id && d.status !== 'resolved')
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!selectedBookingId) {
      Alert.alert('Choose a rental', 'Pick the booking your dispute is about.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Describe the issue', 'Tell us what happened so we can investigate.');
      return;
    }
    setSubmitting(true);
    try {
      await api.fileDispute(selectedBookingId, reason, description);
      setSelectedBookingId('');
      setDescription('');
      setReason('damage');
      await load();
      Alert.alert('Dispute filed', 'The campus admin team will review it using the photo evidence.');
    } catch (e) {
      Alert.alert('Could not file dispute', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Disputes" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Disputes" subtitle="Deposit protection" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!filing ? (
          <Button title="File a dispute" onPress={() => setFiling(true)} />
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>File a dispute</Text>
            <Text style={styles.formHint}>Pick the rental and explain what went wrong.</Text>

            <Text style={styles.fieldLabel}>Rental</Text>
            {completed.length === 0 ? (
              <Text style={styles.formHint}>No eligible rentals yet.</Text>
            ) : (
              completed.map((b) => {
                const active = selectedBookingId === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bookingOption, active && styles.bookingOptionActive]}
                    onPress={() => setSelectedBookingId(b.id)}
                  >
                    <Feather name="package" size={16} color={active ? colors.primary.contrast : colors.neutral.textSecondary} />
                    <Text style={[styles.bookingOptionText, active && styles.bookingOptionTextActive]} numberOfLines={1}>
                      {b.itemTitle} — with {b.lenderId === CURRENT_USER.id ? b.borrowerName : b.lenderName}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}

            <Text style={styles.fieldLabel}>Reason</Text>
            <View style={styles.reasons}>
              {REASONS.map((r) => {
                const active = reason === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.reason, active && styles.reasonActive]}
                    onPress={() => setReason(r.key)}
                  >
                    <Text style={[styles.reasonLabel, active && styles.reasonLabelActive]}>{r.label}</Text>
                    <Text style={[styles.reasonDesc, active && styles.reasonDescActive]}>{r.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Describe what happened"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
              placeholder="What was the condition or timing issue?"
            />

            <Button title="Submit dispute" onPress={submit} loading={submitting} />
            <View style={styles.cancelRow}>
              <TouchableOpacity onPress={() => setFiling(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Your disputes</Text>
        {disputes.length === 0 ? (
          <EmptyState
            icon="shield"
            title="No disputes"
            message="If a rental goes wrong, file a dispute here and the admin team will review the photo evidence."
          />
        ) : (
          disputes.map((d) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.title} numberOfLines={1}>{d.itemTitle}</Text>
                <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[d.status] + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[d.status] }]}>
                    {d.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>
              <Text style={styles.reasonLine}>{REASONS.find((r) => r.key === d.reason)?.label}</Text>
              <Text style={styles.description}>{d.description}</Text>
              {d.resolution ? (
                <View style={styles.resolution}>
                  <Feather name="check-circle" size={14} color={colors.accent.main} />
                  <Text style={styles.resolutionText}>{d.resolution}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}

        <View style={styles.note}>
          <Feather name="info" size={14} color={colors.state.info} />
          <Text style={styles.noteText}>
            Disputes are reviewed against the timestamped before/after condition photos captured in
            the handover flow.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[8], gap: spacing[4] },
  formCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
    gap: spacing[3],
  },
  formTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
  },
  formHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  fieldLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing[2],
  },
  bookingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    marginBottom: spacing[2],
  },
  bookingOptionActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  bookingOptionText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  bookingOptionTextActive: { color: colors.primary.contrast },
  reasons: { gap: spacing[2] },
  reason: {
    padding: spacing[3],
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
  },
  reasonActive: { borderColor: colors.primary.main, backgroundColor: colors.primary.light },
  reasonLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  reasonLabelActive: { color: colors.primary.contrast },
  reasonDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  reasonDescActive: { color: colors.primary.contrast, opacity: 0.9 },
  cancelRow: { alignItems: 'center' },
  cancelText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
    gap: spacing[1],
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing[3] },
  title: {
    flex: 1,
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  statusPill: { paddingHorizontal: spacing[3], paddingVertical: 4, borderRadius: borders.radius.pill },
  statusText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    textTransform: 'capitalize',
  },
  reasonLine: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  description: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  resolution: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: '#EAF7EF',
    borderRadius: borders.radius.md,
    padding: spacing[3],
    marginTop: spacing[1],
  },
  resolutionText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textPrimary,
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