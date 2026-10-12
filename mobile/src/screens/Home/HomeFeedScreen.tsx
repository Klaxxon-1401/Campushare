import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { CategoryChips, EmptyState, ItemCard, SearchBar } from '../../components';
import { CATEGORY_OPTIONS } from '../../constants/catalog';
import { useItems } from '../../hooks/useItems';
import { api } from '../../services/api';
import { ItemCategory } from '../../types';
import { TabScreenProps } from '../../navigation/types';
import { initials } from '../../utils/format';
import { CURRENT_USER } from '../../services/seed';

export const HomeFeedScreen: React.FC<TabScreenProps<'Home'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [search] = useState('');
  const [unread, setUnread] = useState(0);
  const [notifUnread, setNotifUnread] = useState(0);

  const refreshBadges = useCallback(async () => {
    const [msgs, notes] = await Promise.all([
      api.unreadCount(CURRENT_USER.id),
      api.unreadNotificationCount(CURRENT_USER.id),
    ]);
    setUnread(msgs);
    setNotifUnread(notes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshBadges();
    }, [refreshBadges])
  );

  const { items, loading, refreshing, refresh } = useItems({ category, q: search });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <View>
          <Text style={styles.logo}>CampusShare</Text>
          <View style={styles.verifiedRow}>
            <Feather name="shield" size={12} color={colors.accent.main} />
            <Text style={styles.verified}>University Verified Only</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Conversations')}
          >
            <Feather name="message-circle" size={22} color={colors.neutral.textPrimary} />
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Feather name="bell" size={22} color={colors.neutral.textPrimary} />
            {notifUnread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{notifUnread > 9 ? '9+' : notifUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{initials(CURRENT_USER.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar
          value=""
          placeholder="Search lab coats, calculators, blazers…"
          onPress={() => navigation.navigate('SearchResults', {})}
        />
      </View>

      <CategoryChips
        options={CATEGORY_OPTIONS}
        selected={category}
        onSelect={(key) => setCategory(key as ItemCategory | 'all')}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Near You</Text>
        <Text style={styles.count}>{items.length} items</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refresh}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No items found"
              message="Try a different category or check back soon — new listings are added daily."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: borders.width.thin,
    borderBottomColor: colors.neutral.border,
  },
  logo: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.primary.main,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  verified: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.accent.main,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.state.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.neutral.background,
  },
  unreadText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.caption,
    color: colors.primary.contrast,
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.contrast,
  },
  searchWrap: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  count: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
  },
  row: {
    gap: spacing[3],
    marginBottom: spacing[3],
  },
});
