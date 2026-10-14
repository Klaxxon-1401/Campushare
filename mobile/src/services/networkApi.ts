import { request, setAuthToken, ApiError as HttpApiError } from './http';
import { saveToken, loadToken, clearToken } from './tokenStore';
import {
  Item,
  ItemDraft,
  ItemQuery,
  ItemStatus,
  Booking,
  BookingStatus,
  AvailabilityDay,
} from '../types';

const API_BASE = '/v1';

// --- Helpers --------------------------------------------------------------

/** Refresh the auth token from secure storage before authenticated calls. */
async function ensureAuth(): Promise<string | null> {
  const token = await loadToken();
  if (token) {
    setAuthToken(token);
    return token;
  }
  return null;
}

/** Wrap API calls that require auth. */
async function authedRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
  await ensureAuth();
  return request<T>(path, options);
}

// --- Items API ------------------------------------------------------------

export interface ListItemsResponse {
  items: Item[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function listItems(query: ItemQuery & { page?: number; limit?: number } = {}): Promise<Item[]> {
  const { page = 1, limit = 20, ...filters } = query;
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.location) params.set('location', filters.location);
  if (filters.ownerId) params.set('ownerId', filters.ownerId);
  if (filters.includeDrafts) params.set('includeDrafts', 'true');
  params.set('page', String(page));
  params.set('limit', String(limit));

  const response = await authedRequest<ListItemsResponse>(`${API_BASE}/items?${params.toString()}`);
  return response.items;
}

export async function getItem(id: string): Promise<Item> {
  const response = await authedRequest<{ item: Item }>(`${API_BASE}/items/${id}`);
  return response.item;
}

export async function createItem(draft: ItemDraft): Promise<Item> {
  const response = await authedRequest<{ item: Item }>(`${API_BASE}/items`, {
    method: 'POST',
    body: draft,
  });
  return response.item;
}

export async function updateItem(
  id: string,
  patch: Partial<ItemDraft> & { status?: ItemStatus }
): Promise<Item> {
  const response = await authedRequest<{ item: Item }>(`${API_BASE}/items/${id}`, {
    method: 'PATCH',
    body: patch,
  });
  return response.item;
}

export async function deleteItem(id: string): Promise<void> {
  await authedRequest(`${API_BASE}/items/${id}`, { method: 'DELETE' });
}

export async function getAvailability(
  itemId: string,
  year: number,
  month: number // 0-indexed
): Promise<AvailabilityDay[]> {
  const response = await authedRequest<{ availability: AvailabilityDay[] }>(
    `${API_BASE}/items/${itemId}/availability?year=${year}&month=${month}`
  );
  return response.availability;
}

// --- Bookings API ---------------------------------------------------------

export interface CreateBookingInput {
  itemId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const response = await authedRequest<{ booking: Booking }>(`${API_BASE}/bookings`, {
    method: 'POST',
    body: input,
  });
  return response.booking;
}

export async function listBookings(opts: { role?: 'borrower' | 'lender' } = {}): Promise<Booking[]> {
  const params = new URLSearchParams();
  if (opts.role === 'lender') params.set('lender', 'true');
  const response = await authedRequest<{ bookings: Booking[] }>(
    `${API_BASE}/bookings?${params.toString()}`
  );
  return response.bookings;
}

export async function getBooking(id: string): Promise<Booking> {
  const response = await authedRequest<{ booking: Booking }>(`${API_BASE}/bookings/${id}`);
  return response.booking;
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const actionMap: Record<BookingStatus, { action: string; method: 'POST' | 'PATCH' }> = {
    accepted: { action: 'accept', method: 'PATCH' },
    declined: { action: 'decline', method: 'PATCH' },
    paid: { action: 'pay', method: 'POST' },
    active: { action: 'pickup', method: 'POST' },
    returned: { action: 'return', method: 'POST' },
    cancelled: { action: 'cancel', method: 'PATCH' },
    requested: { action: 'requested', method: 'PATCH' },
    disputed: { action: 'disputed', method: 'PATCH' },
  };
  const { action, method } = actionMap[status];
  if (!action || action === status) {
    throw new HttpApiError(400, 'BAD_STATE', `Cannot transition to ${status} directly`);
  }
  const response = await authedRequest<{ booking: Booking }>(
    `${API_BASE}/bookings/${id}/${action}`,
    { method }
  );
  return response.booking;
}

// Convenience wrappers matching localStore
export const acceptBooking = (id: string) => setBookingStatus(id, 'accepted');
export const declineBooking = (id: string) => setBookingStatus(id, 'declined');
export const payBooking = (id: string) => setBookingStatus(id, 'paid');
export const cancelBooking = (id: string) => setBookingStatus(id, 'cancelled');

// Confirm pickup (borrower or lender) -> status 'active'
export async function confirmPickup(id: string): Promise<Booking> {
  const response = await authedRequest<{ booking: Booking }>(
    `${API_BASE}/bookings/${id}/pickup`,
    { method: 'PATCH' }
  );
  return response.booking;
}

// Confirm return (borrower uploads photos) -> status 'returned'
export async function confirmReturn(id: string): Promise<Booking> {
  const response = await authedRequest<{ booking: Booking }>(
    `${API_BASE}/bookings/${id}/return`,
    { method: 'PATCH' }
  );
  return response.booking;
}

// Confirm return final (lender confirms) -> status 'returned' (idempotent)
export async function confirmReturnFinal(id: string): Promise<Booking> {
  const response = await authedRequest<{ booking: Booking }>(
    `${API_BASE}/bookings/${id}/confirm-return`,
    { method: 'PATCH' }
  );
  return response.booking;
}

// --- Auth token management ------------------------------------------------

/** Call this after login/register/verify to attach the token. */
export function setAuthTokenFromLogin(token: string): void {
  setAuthToken(token);
}

/** Call this on logout. */
export function clearAuthToken(): void {
  setAuthToken(null);
}