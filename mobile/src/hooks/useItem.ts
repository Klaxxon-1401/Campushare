import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../services/api';
import { Booking, Item } from '../types';

interface UseItemResult {
  item: Item | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useItem = (itemId: string): UseItemResult => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItem(await api.getItem(itemId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load this item.');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  return { item, loading, error, refresh: load };
};

interface UseBookingsResult {
  bookings: Booking[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBookings = (role: 'borrower' | 'lender' = 'borrower'): UseBookingsResult => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        setBookings(await api.listBookings({ role }));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Could not load bookings.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [role]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return { bookings, loading, refreshing, error, refresh: () => load(true) };
};
