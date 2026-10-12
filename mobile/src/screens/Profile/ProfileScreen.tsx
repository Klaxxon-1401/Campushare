import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borders } from '../../theme';
import { Badge } from '../../components';
import { api } from '../../services/api';
import { CURRENT_USER } from '../../services/seed';
import { TabScreenProps } from '../../navigation/types';
import { initials } from '../../utils/format';

interface MenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  hint?: string;
  badge?: number;
  onPress: () => void;
}

export const ProfileScreen: React.FC<TabScreenProps<'Profile'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user = CURRENT_USER;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.unreadCount(CURRENT_USER.id).then((n) => {
      if (mounted) setUnread(n);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const menu: MenuItem[] = [
    { icon: 'message-circle', label: 'Messages', hint: 'Chat about rentals', badge: unread, onPress: () => navigation.navigate('Conversations') },
    { icon: 'tag', label: 'My Listings', hint: 'Items you lend out', onPress: () => navigation.navigate('MyListings') },
    { icon: 'package', label: 'My Bookings', hint: 'Borrowing & lending', onPress: () => navigation.navigate('Bookings') },
    { icon: 'camera', label: 'Returns', hint: 'Photo proof & deposits', onPress: () => navigation.navigate('Returns') },
    { icon: 'star', label: 'Reviews', hint: 'Rate and read reviews', onPress: () => navigation.navigate('Reviews', {}) },
    { icon: 'shield', label: 'Disputes', hint: 'Deposit protection cases', onPress: () => navigation.navigate('Disputes') },
    { icon: 'settings', label: 'Settings', hint: 'Account & privacy', onPress: () => Alert.alert('Coming soon', 'Settings will be added in a later milestone.') },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(user.name)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.campusEmail}</Text>
        <View style={styles.badgeRow}>
          <Badge label="✓ Verified student" variant="success" size="small" />
          <View style={styles.ratingPill}>
            <Feather name="star" size={12} color={colors.state.warning} />
            <Text style={styles.ratingText}>
              {user.rating.toFixed(1)} ({user.reviewCount})
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.menu}>
          {menu.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < menu.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Feather name={item.icon} size={18} color={colors.primary.main} />
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.hint ? <Text style={styles.menuHint}>{item.hint}</Text> : null}
              </View>
              {item.badge && item.badge > 0 ? (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              ) : null}
              <Feather name="chevron-right" size={18} color={colors.neutral.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logout} onPress={() => navigation.navigate('Welcome')}>
          <Feather name="log-out" size={16} color={colors.state.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CampusShare · v1.0 · Week 6 build</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.background },
  header: {
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primary.contrast,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h1,
    color: colors.primary.main,
  },
  name: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h2,
    color: colors.primary.contrast,
  },
  email: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.primary.contrast,
    opacity: 0.9,
    marginTop: spacing[1],
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[3] },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borders.radius.pill,
  },
  ratingText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.neutral.textPrimary,
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[8] },
  menu: {
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  menuItemBorder: {
    borderBottomWidth: borders.width.thin,
    borderBottomColor: colors.neutral.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: { flex: 1 },
  menuLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  menuHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.small,
    color: colors.primary.contrast,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[6],
    paddingVertical: spacing[3],
  },
  logoutText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.state.error,
  },
  version: {
    textAlign: 'center',
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    marginTop: spacing[2],
  },
});
