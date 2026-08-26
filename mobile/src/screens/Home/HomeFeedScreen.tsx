import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, typography, spacing, borders } from '../../theme';
import { Card, Badge } from '../../components/ui';

interface HomeFeedScreenProps {
  navigation: any;
}

const CATEGORIES = ['All', 'Academic', 'Clothing', 'Electronics', 'Fitness'];

const MOCK_ITEMS = [
  {
    id: '1',
    title: 'Chemistry Lab Coat (Size M)',
    category: 'Academic',
    price: 3,
    deposit: 10,
    location: 'North Campus',
    lender: { name: 'John D.', verified: true, rating: 4.8 },
  },
  {
    id: '2',
    title: 'TI-84 Graphing Calculator',
    category: 'Electronics',
    price: 5,
    deposit: 25,
    location: 'Library',
    lender: { name: 'Sarah M.', verified: true, rating: 4.9 },
  },
  {
    id: '3',
    title: 'Interview Blazer (Navy, 38R)',
    category: 'Clothing',
    price: 8,
    deposit: 30,
    location: 'South Dorms',
    lender: { name: 'Mike R.', verified: true, rating: 4.7 },
  },
  {
    id: '4',
    title: '20lb Dumbbell Set',
    category: 'Fitness',
    price: 4,
    deposit: 15,
    location: 'West Campus',
    lender: { name: 'Lisa K.', verified: true, rating: 4.6 },
  },
];

export const HomeFeedScreen: React.FC<HomeFeedScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MOCK_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderItem = ({ item }: { item: typeof MOCK_ITEMS[0] }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
      {/* Image Placeholder */}
      <View style={styles.itemImage}>
        <Text style={styles.itemImagePlaceholder}>📷</Text>
        <Badge label={item.category} variant="primary" size="small" style={styles.categoryBadge} />
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.itemLocation}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${item.price}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>
          <View style={styles.depositContainer}>
            <Text style={styles.depositLabel}>Deposit</Text>
            <Text style={styles.depositValue}>${item.deposit}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>CampusShare</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>🛡️ University Verified Only</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>
          Search lab coats, calculators, blazers...
        </Text>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Near You</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Item Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.itemRow}
        contentContainerStyle={styles.itemList}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📷</Text>
          <Text style={styles.navText}>Returns</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: spacing[12],
    paddingBottom: spacing[3],
    backgroundColor: colors.neutral.surface,
    borderBottomWidth: borders.width.thin,
    borderBottomColor: colors.neutral.border,
  },
  logoText: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.h3,
    color: colors.primary.main,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  verifiedText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.accent.main,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.primary.contrast,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
  },
  searchIcon: {
    fontSize: typography.sizes.bodyLarge,
    marginRight: spacing[2],
  },
  searchPlaceholder: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.neutral.textMuted,
  },
  categoryContainer: {
    maxHeight: 44,
    marginBottom: spacing[3],
  },
  categoryContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  categoryChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borders.radius.pill,
    backgroundColor: colors.neutral.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary.main,
  },
  categoryChipText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
  },
  categoryChipTextActive: {
    color: colors.primary.contrast,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.bodyLarge,
    color: colors.neutral.textPrimary,
  },
  seeAllText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body,
    color: colors.primary.main,
  },
  itemList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  itemRow: {
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  itemCard: {
    flex: 1,
    backgroundColor: colors.neutral.surface,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  itemImage: {
    height: 120,
    backgroundColor: colors.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemImagePlaceholder: {
    fontSize: 24,
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
  },
  itemContent: {
    padding: spacing[3],
  },
  itemTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textPrimary,
    marginBottom: spacing[1],
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  locationIcon: {
    fontSize: typography.sizes.small,
    marginRight: spacing[1],
  },
  locationText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    paddingTop: spacing[2],
  },
  price: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h4,
    color: colors.primary.main,
  },
  priceUnit: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textSecondary,
  },
  depositContainer: {
    alignItems: 'flex-end',
  },
  depositLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  depositValue: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body,
    color: colors.neutral.textSecondary,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.neutral.surface,
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral.border,
    paddingVertical: spacing[2],
    paddingBottom: spacing[6],
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: typography.sizes.h4,
    marginBottom: spacing[1],
  },
  navIconActive: {
    color: colors.primary.main,
  },
  navText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    color: colors.neutral.textMuted,
  },
  navTextActive: {
    color: colors.primary.main,
    fontFamily: typography.fonts.bodyBold,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: typography.sizes.h2,
    color: colors.primary.contrast,
    fontFamily: typography.fonts.bodyBold,
  },
});
