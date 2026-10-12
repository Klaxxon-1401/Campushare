import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { EmptyState, ScreenHeader } from '../../components';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { Conversation } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { formatLong } from '../../utils/date';

export const ConversationsScreen: React.FC<StackScreenProps<'Conversations'>> = ({ navigation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setConversations(await api.listConversations(CURRENT_USER.id));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const otherName = (c: Conversation): string => {
    const theirs = c.memberIds.find((id) => id !== CURRENT_USER.id);
    return theirs ? c.memberNames[theirs] ?? 'Unknown' : 'Unknown';
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Messages" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary.main} />
          }
          renderItem={({ item }) => {
            const unread = item.unreadBy[CURRENT_USER.id] ?? 0;
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{otherName(item).charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.name, unread > 0 && styles.nameUnread]} numberOfLines={1}>
                      {otherName(item)}
                    </Text>
                    <Text style={styles.time}>{formatLong(item.lastMessageAt.slice(0, 10))}</Text>
                  </View>
                  <View style={styles.subRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      📦 {item.itemTitle}
                    </Text>
                  </View>
                </View>
                {unread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="message-circle"
              title="No conversations yet"
              message="Messages appear here once you have an active or completed booking."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4], gap: spacing[1] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borders.radius.lg,
    backgroundColor: colors.neutral.surface,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.primary.contrast,
  },
  info: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  nameUnread: { fontFamily: typography.fonts.bodyBold },
  time: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemTitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.contrast,
  },
});