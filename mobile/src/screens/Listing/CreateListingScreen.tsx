import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Button, CategoryChips, Input, ScreenHeader } from '../../components';
import { CATEGORY_OPTIONS, CAMPUS_LOCATIONS, SUGGESTED_DEPOSIT, SUGGESTED_RATE } from '../../constants/catalog';
import { api, ApiError } from '../../services/api';
import { ItemCategory } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { categoryLabel, formatMoney } from '../../utils/format';
import { MIN_PRICE_PER_DAY, isValidDayRate } from '../../utils/pricing';

const STEPS = ['Details', 'Photo & pricing', 'Review'];

export const CreateListingScreen: React.FC<StackScreenProps<'CreateListing'>> = ({
  navigation,
  route,
}) => {
  const editingId = route.params?.itemId;
  const isEdit = Boolean(editingId);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('academic');
  const [description, setDescription] = useState('');
  const [conditionNote, setConditionNote] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const item = await api.getItem(editingId);
        setTitle(item.title);
        setCategory(item.category);
        setDescription(item.description);
        setConditionNote(item.conditionNote ?? '');
        setPrice(String(item.pricePerDay));
        setDeposit(String(item.deposit));
        setLocation(item.location);
      } catch {
        Alert.alert('Error', 'Could not load this listing.');
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId]);

  const priceNum = Number(price) || 0;
  const depositNum = Number(deposit) || 0;

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!title.trim()) return 'Give your item a title.';
      if (title.trim().length < 3) return 'The title is a bit too short.';
      if (!description.trim()) return 'Add a short description.';
    }
    if (step === 1) {
      if (!price || !isValidDayRate(priceNum))
        return `Set a price of at least ${formatMoney(MIN_PRICE_PER_DAY)} per day.`;
      if (deposit === '' || depositNum < 0) return 'Set a deposit (0 if you need none).';
      if (!location) return 'Pick a pickup location.';
    }
    return null;
  }, [step, title, description, price, priceNum, deposit, depositNum, location]);

  const onNext = () => {
    if (stepError) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onPublish = async () => {
    setSaving(true);
    try {
      const draft = {
        title: title.trim(),
        category,
        description: description.trim(),
        conditionNote: conditionNote.trim() || undefined,
        pricePerDay: priceNum,
        deposit: depositNum,
        location,
        photos: [],
      };
      const item = isEdit && editingId
        ? await api.updateItem(editingId, draft)
        : await api.createItem(draft);
      const published = await api.setItemStatus(item.id, 'published');
      navigation.replace('ItemDetail', { itemId: published.id });
    } catch (e) {
      Alert.alert('Could not save listing', e instanceof ApiError ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Listing" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      </View>
    );
  }

  const isLast = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title={isEdit ? 'Edit Listing' : 'New Listing'}
        subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
        onBack={() => (step === 0 ? navigation.goBack() : setStep((s) => s - 1))}
      />

      {/* Progress */}
      <View style={styles.progress}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressBar, i <= step && styles.progressBarActive]} />
            <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <>
            <Input
              label="Item title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Chemistry Lab Coat (Size M)"
              maxLength={80}
            />
            <Text style={styles.fieldLabel}>Category</Text>
            <CategoryChips
              options={CATEGORY_OPTIONS.filter((o) => o.key !== 'all')}
              selected={category}
              onSelect={(k) => setCategory(k as ItemCategory)}
            />
            <View style={styles.gap} />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="What is it, what condition is it in, who is it for?"
              multiline
              numberOfLines={4}
              maxLength={2000}
              style={styles.textArea}
            />
          </>
        )}

        {step === 1 && (
          <>
            <View style={styles.photoBox}>
              <Feather name="camera" size={28} color={colors.primary.main} />
              <Text style={styles.photoTitle}>Condition photos</Text>
              <Text style={styles.photoHint}>
                In-app camera capture arrives in the next milestone. Your listing will still publish
                now and you can add photos later.
              </Text>
            </View>

            <Input
              label="Condition note (optional)"
              value={conditionNote}
              onChangeText={setConditionNote}
              placeholder="e.g. Minor ink mark on left sleeve"
              maxLength={200}
            />

            <Input
              label="Price per day (₹)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder={String(SUGGESTED_RATE[category])}
              helperText={`Min ${formatMoney(MIN_PRICE_PER_DAY)}/day · suggested for ${categoryLabel(
                category
              )}: ${formatMoney(SUGGESTED_RATE[category])}/day`}
            />
            <Input
              label="Refundable deposit (₹)"
              value={deposit}
              onChangeText={setDeposit}
              keyboardType="numeric"
              placeholder={String(SUGGESTED_DEPOSIT[category])}
              helperText={`Fully refunded on a clean return · suggested ${formatMoney(
                SUGGESTED_DEPOSIT[category]
              )} (about 10% of the item's value)`}
            />

            <Text style={styles.fieldLabel}>Pickup location</Text>
            <CategoryChips
              options={CAMPUS_LOCATIONS.map((l) => ({ key: l, label: l }))}
              selected={location}
              onSelect={setLocation}
            />
          </>
        )}

        {step === 2 && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>{title || 'Untitled item'}</Text>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Category</Text>
              <Text style={styles.reviewValue}>{categoryLabel(category)}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Location</Text>
              <Text style={styles.reviewValue}>{location}</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Price</Text>
              <Text style={styles.reviewValue}>{formatMoney(priceNum)}/day</Text>
            </View>
            <View style={styles.reviewRow}>
              <Text style={styles.reviewLabel}>Deposit</Text>
              <Text style={styles.reviewValue}>{formatMoney(depositNum)}</Text>
            </View>
            <View style={styles.reviewDivider} />
            <Text style={styles.reviewDesc}>{description || 'No description'}</Text>
            {conditionNote ? <Text style={styles.reviewNote}>Note: {conditionNote}</Text> : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {stepError && step !== 2 ? (
          <Text style={styles.errorText}>{stepError}</Text>
        ) : null}
        {isLast ? (
          <Button
            title={isEdit ? 'Save changes' : 'Publish listing'}
            onPress={onPublish}
            loading={saving}
            disabled={Boolean(stepError)}
          />
        ) : (
          <Button title="Continue" onPress={onNext} disabled={Boolean(stepError)} />
        )}
        {step > 0 && (
          <TouchableOpacity style={styles.backLink} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.backLinkText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progress: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral.surface,
    gap: spacing[2],
  },
  progressItem: { flex: 1, alignItems: 'center', gap: spacing[1] },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.border,
  },
  progressBarActive: { backgroundColor: colors.primary.main },
  progressLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  progressLabelActive: { color: colors.primary.main, fontFamily: typography.fonts.bodyBold },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  fieldLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    color: colors.neutral.textSecondary,
    marginBottom: spacing[2],
  },
  gap: { height: spacing[4] },
  textArea: { height: 100, paddingTop: spacing[2] },
  photoBox: {
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    padding: spacing[5],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  photoTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  photoHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.small * typography.lineHeights.normal,
  },
  reviewCard: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  reviewTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[3],
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  reviewLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  reviewValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  reviewDivider: {
    height: borders.width.thin,
    backgroundColor: colors.neutral.border,
    marginVertical: spacing[3],
  },
  reviewDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
    lineHeight: typography.sizes.body * typography.lineHeights.normal,
  },
  reviewNote: {
    marginTop: spacing[2],
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.state.info,
  },
  bottomBar: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    gap: spacing[2],
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.state.error,
    textAlign: 'center',
  },
  backLink: { alignItems: 'center', paddingVertical: spacing[1] },
  backLinkText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
});
