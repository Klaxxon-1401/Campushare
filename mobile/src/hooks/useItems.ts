import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../services/api';
import { Item, ItemQuery } from '../types';

interface UseItemsResult {
  items: Item[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

/** Loads a filtered list of items; re-runs whenever the query fields change. */
export const useItems = (query: ItemQuery): UseItemsResult => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = query.q ?? '';
  const category = query.category ?? 'all';
  const location = query.location ?? '';
  const ownerId = query.ownerId ?? '';

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await api.listItems({ q, category, location, ownerId });
        setItems(result);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Something went wrong loading items.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [q, category, location, ownerId]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return { items, loading, refreshing, error, refresh: () => load(true) };
};
