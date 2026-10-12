import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { AvailabilityCalendar, Badge, Button, EmptyState, ScreenHeader } from '../../components';
import { useItem } from '../../hooks/useItem';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { AvailabilityState } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { categoryLabel, formatMoney } from '../../utils/format';
import { CATEGORY_ICONS } from '../../constants/catalog';

export const ItemDetailScreen: React.FC<StackScreenProps<'ItemDetail'>> = ({
  navigation,
  route,
}) => {
  const { itemId } = route.params;
  const { item, loading, error } = useItem(itemId);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [availability, setAvailability] = useState<Record<string, AvailabilityState>>({});

  const loadAvailability = useCallback(async () => {
    const days = await api.getAvailability(itemId, year, month);
    setAvailability(Object.fromEntries(days.map((d) => [d.date, d.state])));
  }, [itemId, year, month]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Item" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Item" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="alert-circle"
          title="Item unavailable"
          message={error ?? 'This listing could not be found.'}
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const isOwner = item.ownerId === CURRENT_USER.id;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Item Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photo / placeholder */}
        <View style={styles.photo}>
          <Feather name={CATEGORY_ICONS[item.category]} size={72} color={colors.neutral.textMuted} />
          <Badge
            label={categoryLabel(item.category)}
            variant="primary"
            size="small"
            style={styles.photoBadge}
          />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color={colors.neutral.textSecondary} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>

          {/* Pricing */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceValue}>{formatMoney(item.pricePerDay)}</Text>
              <Text style={styles.priceUnit}>per day</Text>
            </View>
            <View style={styles.depositBlock}>
              <Text style={styles.depositLabel}>Refundable deposit</Text>
              <Text style={styles.depositValue}>{formatMoney(item.deposit)}</Text>
            </View>
          </View>

          {/* Owner */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerInitial}>{item.ownerName.charAt(0)}</Text>
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{item.ownerName}</Text>
              <View style={styles.ownerMeta}>
                {item.ownerVerified && (
                  <View style={styles.verifiedTag}>
                    <Feather name="shield" size={12} color={colors.accent.main} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
                <View style={styles.ratingRow}>
                  <Feather name="star" size={13} color={colors.state.warning} />
                  <Text style={styles.rating}>{item.ownerRating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          {item.conditionNote ? (
            <>
              <Text style={styles.sectionTitle}>Condition note</Text>
              <View style={styles.conditionNote}>
                <Feather name="info" size={14} color={colors.state.info} />
                <Text style={styles.conditionText}>{item.conditionNote}</Text>
              </View>
            </>
          ) : null}

          {/* Availability */}
          <Text style={styles.sectionTitle}>Availability</Text>
          <AvailabilityCalendar
            year={year}
            month={month}
            availability={availability}
            onChangeMonth={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
          />

          <View style={styles.trustNote}>
            <Feather name="camera" size={16} color={colors.accent.main} />
            <Text style={styles.trustText}>
              Condition photos are taken before and after every rental, and your deposit is only
              released once the item is returned in its recorded condition.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>{formatMoney(item.pricePerDay)}/day</Text>
          <Text style={styles.bottomDeposit}>+{formatMoney(item.deposit)} deposit</Text>
        </View>
        {isOwner ? (
          <TouchableOpacity
            style={styles.ownerAction}
            onPress={() => navigation.navigate('CreateListing', { itemId: item.id })}
          >
            <Text style={styles.ownerActionText}>Edit listing</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bookButton}>
            <Button
              title="Book this item"
              onPress={() => navigation.navigate('BookingRequest', { itemId: item.id })}
              size="medium"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: spacing[8] },
  photo: {
    height: 200,
    backgroundColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: { position: 'absolute', top: spacing[3], left: spacing[3] },
  body: { padding: spacing[4] },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[2],
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  metaText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  priceValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h1,
    color: colors.primary.main,
  },
  priceUnit: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  depositBlock: { alignItems: 'flex-end' },
  depositLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  depositValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.neutral.textPrimary,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
    marginTop: spacing[3],
    gap: spacing[3],
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.primary.contrast,
  },
  ownerInfo: { flex: 1 },
  ownerName: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  ownerMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[1] },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  verifiedText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.accent.main,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  rating: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.state.warning,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  description: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    lineHeight: typography.sizes.body * typography.lineHeights.relaxed,
  },
  conditionNote: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
  },
  conditionText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    lineHeight: typography.sizes.body * typography.lineHeights.normal,
  },
  trustNote: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[5],
    padding: spacing[3],
    backgroundColor: '#EAF7EF',
    borderRadius: borders.radius.md,
  },
  trustText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textPrimary,
    lineHeight: typography.sizes.small * typography.lineHeights.normal,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  bottomPrice: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.primary.main,
  },
  bottomDeposit: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  bookButton: { minWidth: 180 },
  ownerAction: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borders.radius.md,
    borderWidth: borders.width.thin,
    borderColor: colors.primary.main,
  },
  ownerActionText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
});
