import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { Badge, Button, EmptyState, ScreenHeader } from '../../components';
import { useItems } from '../../hooks/useItems';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Item, ItemStatus } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { formatMoney } from '../../utils/format';
import { CATEGORY_ICONS } from '../../constants/catalog';

const STATUS_VARIANT: Record<ItemStatus, 'success' | 'warning' | 'primary' | 'error'> = {
  published: 'success',
  draft: 'warning',
  booked: 'primary',
  inactive: 'error',
};

export const MyListingsScreen: React.FC<StackScreenProps<'MyListings'>> = ({ navigation }) => {
  const { items, loading, refreshing, refresh } = useItems({ ownerId: CURRENT_USER.id });

  const [busyId, setBusyId] = useState<string | null>(null);

  const setStatus = useCallback(
    async (item: Item, status: ItemStatus) => {
      setBusyId(item.id);
      try {
        await api.setItemStatus(item.id, status);
        refresh();
      } catch {
        Alert.alert('Error', 'Could not update the listing.');
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  const remove = (item: Item) => {
    Alert.alert('Delete listing', `Delete “${item.title}”? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.deleteItem(item.id);
          refresh();
        },
      },
    ]);
  };

  const renderItem = (item: Item) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.thumb}>
          <Feather name={CATEGORY_ICONS[item.category]} size={26} color={colors.primary.main} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.price}>
            {formatMoney(item.pricePerDay)}/day · {formatMoney(item.deposit)} deposit
          </Text>
        </View>
        <Badge label={item.status} variant={STATUS_VARIANT[item.status]} size="small" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('CreateListing', { itemId: item.id })}
        >
          <Feather name="edit-2" size={14} color={colors.primary.main} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        {item.status === 'published' ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setStatus(item, 'inactive')}
            disabled={busyId === item.id}
          >
            <Feather name="pause-circle" size={14} color={colors.neutral.textSecondary} />
            <Text style={[styles.actionText, styles.actionMuted]}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setStatus(item, 'published')}
            disabled={busyId === item.id}
          >
            <Feather name="upload" size={14} color={colors.accent.main} />
            <Text style={[styles.actionText, styles.actionSuccess]}>Publish</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionBtn} onPress={() => remove(item)}>
          <Feather name="trash-2" size={14} color={colors.state.error} />
          <Text style={[styles.actionText, styles.actionDanger]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Listings"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('CreateListing', {})}>
            <Feather name="plus" size={22} color={colors.primary.contrast} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refresh}
          renderItem={({ item }) => renderItem(item)}
          ListEmptyComponent={
            <EmptyState
              icon="tag"
              title="No listings yet"
              message="Lend out the things you own but rarely use — calculators, blazers, sports gear."
              actionLabel="Create a listing"
              onAction={() => navigation.navigate('CreateListing', {})}
            />
          }
        />
      )}

      <View style={styles.bottomBar}>
        <Button title="+ New listing" onPress={() => navigation.navigate('CreateListing', {})} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[8] },
  card: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[3],
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: borders.radius.md,
    backgroundColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  title: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  price: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    marginTop: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[5],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  actionText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.main,
  },
  actionMuted: { color: colors.neutral.textSecondary },
  actionSuccess: { color: colors.accent.main },
  actionDanger: { color: colors.state.error },
  bottomBar: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
  },
});
