import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { CategoryChips, EmptyState, ItemCard, SearchBar, ScreenHeader } from '../../components';
import { CATEGORY_OPTIONS, CAMPUS_LOCATIONS } from '../../constants/catalog';
import { useItems } from '../../hooks/useItems';
import { ItemCategory } from '../../types';
import { StackScreenProps } from '../../navigation/types';

export const SearchResultsScreen: React.FC<StackScreenProps<'SearchResults'>> = ({
  navigation,
  route,
}) => {
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [location, setLocation] = useState('');

  const { items, loading } = useItems({ q: query, category, location });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Search" onBack={() => navigation.goBack()} />

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} autoFocus />
      </View>

      <CategoryChips
        options={CATEGORY_OPTIONS}
        selected={category}
        onSelect={(key) => setCategory(key as ItemCategory | 'all')}
      />

      <CategoryChips
        options={[
          { key: '', label: 'All Locations' },
          ...CAMPUS_LOCATIONS.map((l) => ({ key: l, label: l })),
        ]}
        selected={location}
        onSelect={setLocation}
      />

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>
          {loading ? 'Searching…' : `${items.length} ${items.length === 1 ? 'result' : 'results'}`}
        </Text>
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
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No matching items"
              message="Try fewer keywords, a different category, or a broader location."
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
  searchWrap: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  resultHeader: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  resultCount: {
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
