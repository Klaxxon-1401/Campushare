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
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borders } from '../../theme';
import { EmptyState, ScreenHeader } from '../../components';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { AppNotification, NotificationKind } from '../../types';
import { StackScreenProps } from '../../navigation/types';
import { timeAgo } from '../../utils/date';

/** Feather icon per notification event (PROJECT_PLAN §11.8). */
const KIND_ICON: Record<NotificationKind, keyof typeof Feather.glyphMap> = {
  'booking-requested': 'inbox',
  'request-decision': 'thumbs-up',
  payment: 'credit-card',
  'pickup-pending': 'map-pin',
  'return-pending': 'clock',
  'return-confirmation': 'camera',
  'deposit-refunded': 'rotate-ccw',
  'dispute-update': 'shield',
  message: 'message-circle',
  'review-received': 'star',
};

const KIND_COLOR: Record<NotificationKind, string> = {
  'booking-requested': colors.primary.main,
  'request-decision': colors.accent.main,
  payment: colors.state.info,
  'pickup-pending': colors.primary.main,
  'return-pending': colors.state.warning,
  'return-confirmation': colors.accent.main,
  'deposit-refunded': colors.accent.main,
  'dispute-update': colors.state.warning,
  message: colors.state.info,
  'review-received': colors.state.warning,
};

export const NotificationsScreen: React.FC<StackScreenProps<'Notifications'>> = ({ navigation }) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.listNotifications(CURRENT_USER.id);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const unread = items.filter((n) => !n.read).length;

  const open = async (n: AppNotification) => {
    if (!n.read) {
      await api.markNotificationRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.bookingId) navigation.navigate('BookingDetail', { bookingId: n.bookingId });
  };

  const markAll = async () => {
    await api.markAllNotificationsRead(CURRENT_USER.id);
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        onBack={() => navigation.goBack()}
        right={
          unread > 0 ? (
            <TouchableOpacity onPress={markAll} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary.main} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No notifications"
          message="Activity about your rentals — requests, payments, returns and messages — will show up here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, !item.read && styles.rowUnread]}
              onPress={() => open(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: KIND_COLOR[item.kind] + '1A' }]}>
                <Feather name={KIND_ICON[item.kind]} size={18} color={KIND_COLOR[item.kind]} />
              </View>
              <View style={styles.body}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read ? <View style={styles.dot} /> : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markAll: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.contrast,
  },
  list: { padding: spacing[3], gap: spacing[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    padding: spacing[4],
  },
  rowUnread: { borderColor: colors.primary.light, backgroundColor: '#FFF9F2' },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  message: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    lineHeight: typography.sizes.small * typography.lineHeights.normal,
  },
  time: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    marginTop: spacing[1],
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
    marginTop: spacing[1],
  },
});
