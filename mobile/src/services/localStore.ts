import {
  AvailabilityDay,
  Booking,
  Item,
  ItemDraft,
  ItemQuery,
  ItemStatus,
} from '../types';
import { eachDay, overlaps, todayISO } from '../utils/date';
import { computePrice } from '../utils/pricing';
import { CURRENT_USER, seedBookings, seedItemsResolved, USER_BY_ID } from './seed';

/**
 * In-memory data store used while the Firestore-backed API is being built.
 * Exposes the same async surface the screens will use against the real API so
 * that swapping the implementation is a single-file change.
 *
 * Booking statuses that reserve an item's calendar.
 */
const RESERVING_STATUSES: Booking['status'][] = [
  'requested', 'accepted', 'paid', 'active', 'returned', 'disputed',
];

const MAX_RENTAL_DAYS = 30;

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// ---- state -----------------------------------------------------------------

let items: Item[] = seedItemsResolved();
let bookings: Booking[] = seedBookings();
/** itemId -> explicitly blocked YYYY-MM-DD dates (owner-managed). */
const blockedDates = new Map<string, Set<string>>();

let idCounter = 2000;
const nextId = (prefix: string): string => `${prefix}_${(idCounter++).toString(36)}${Date.now().toString(36).slice(-3)}`;

const delay = <T>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

// ---- helpers ---------------------------------------------------------------

const reservingBookingsFor = (itemId: string): Booking[] =>
  bookings.filter((b) => b.itemId === itemId && RESERVING_STATUSES.includes(b.status));

const isRangeAvailable = (itemId: string, startISO: string, endISO: string): boolean => {
  const blocked = blockedDates.get(itemId);
  if (blocked) {
    for (const d of eachDay(startISO, endISO)) {
      if (blocked.has(d)) return false;
    }
  }
  return !reservingBookingsFor(itemId).some((b) =>
    overlaps(startISO, endISO, b.startDate, b.endDate)
  );
};

const matchesQuery = (item: Item, query: ItemQuery): boolean => {
  if (!query.includeDrafts && item.status !== 'published' && item.ownerId !== query.ownerId) {
    // Non-owners only ever see published listings.
    return false;
  }
  if (query.ownerId && item.ownerId !== query.ownerId) return false;
  if (query.category && query.category !== 'all' && item.category !== query.category) return false;
  if (query.location && item.location !== query.location) return false;
  if (query.q) {
    const needle = query.q.trim().toLowerCase();
    if (needle) {
      const haystack = `${item.title} ${item.description} ${item.location} ${item.category}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }
  return true;
};

// ---- API -------------------------------------------------------------------

export const localStore = {
  getCurrentUser: () => delay(CURRENT_USER),

  listItems: (query: ItemQuery = {}): Promise<Item[]> =>
    delay(
      items
        .filter((i) => matchesQuery(i, query))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    ),

  getItem: (id: string): Promise<Item> => {
    const item = items.find((i) => i.id === id);
    if (!item) {
      return Promise.reject(new ApiError('NOT_FOUND', 'Item not found', 404));
    }
    return delay(item);
  },

  createItem: (draft: ItemDraft, ownerId = CURRENT_USER.id): Promise<Item> => {
    const owner = USER_BY_ID[ownerId] ?? CURRENT_USER;
    const now = new Date().toISOString();
    const item: Item = {
      id: nextId('it'),
      ownerId,
      ownerName: owner.name,
      ownerVerified: owner.verificationStatus === 'verified',
      ownerRating: owner.rating,
      title: draft.title,
      category: draft.category,
      description: draft.description,
      pricePerDay: draft.pricePerDay,
      deposit: draft.deposit,
      location: draft.location,
      conditionNote: draft.conditionNote,
      photos: draft.photos ?? [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    items = [item, ...items];
    return delay(item);
  },

  updateItem: (id: string, patch: Partial<ItemDraft> & { status?: ItemStatus }): Promise<Item> => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      return Promise.reject(new ApiError('NOT_FOUND', 'Item not found', 404));
    }
    const updated: Item = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
    items = [...items.slice(0, idx), updated, ...items.slice(idx + 1)];
    return delay(updated);
  },

  deleteItem: (id: string): Promise<void> => {
    items = items.filter((i) => i.id !== id);
    return delay(undefined);
  },

  setItemStatus: (id: string, status: ItemStatus): Promise<Item> =>
    localStore.updateItem(id, { status }),

  // ---- availability --------------------------------------------------------

  /** Reservations + owner blocks for an item, as raw ranges/dates. */
  getBookedRanges: (itemId: string) =>
    reservingBookingsFor(itemId).map((b) => ({ start: b.startDate, end: b.endDate })),

  getBlockedDates: (itemId: string): string[] =>
    Array.from(blockedDates.get(itemId) ?? []),

  isRangeAvailable,

  /** Day-level availability for a full month grid. */
  getAvailability: (itemId: string, year: number, month: number): Promise<AvailabilityDay[]> => {
    const blocked = blockedDates.get(itemId) ?? new Set<string>();
    const ranges = reservingBookingsFor(itemId);
    const days: AvailabilityDay[] = [];
    const last = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= last; day++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let state: AvailabilityDay['state'] = 'open';
      if (blocked.has(iso)) state = 'blocked';
      else if (ranges.some((b) => iso >= b.startDate && iso <= b.endDate)) state = 'booked';
      days.push({ date: iso, state });
    }
    return delay(days);
  },

  // ---- bookings ------------------------------------------------------------

  createBooking: (input: { itemId: string; startDate: string; endDate: string }): Promise<Booking> => {
    const item = items.find((i) => i.id === input.itemId);
    if (!item) {
      return Promise.reject(new ApiError('NOT_FOUND', 'Item not found', 404));
    }
    if (item.status !== 'published') {
      return Promise.reject(new ApiError('NOT_AVAILABLE', 'This item is not currently available.'));
    }
    if (input.startDate < todayISO()) {
      return Promise.reject(new ApiError('PAST_DATE', 'The start date cannot be in the past.'));
    }
    if (input.endDate < input.startDate) {
      return Promise.reject(new ApiError('BAD_RANGE', 'The end date must be on or after the start date.'));
    }
    const price = computePrice(item.pricePerDay, item.deposit, input.startDate, input.endDate);
    if (price.days > MAX_RENTAL_DAYS) {
      return Promise.reject(
        new ApiError('TOO_LONG', `Rentals can be at most ${MAX_RENTAL_DAYS} days.`)
      );
    }
    if (!isRangeAvailable(item.id, input.startDate, input.endDate)) {
      return Promise.reject(
        new ApiError('UNAVAILABLE', 'Those dates are already booked. Please pick another range.', 409)
      );
    }

    const now = new Date().toISOString();
    const booking: Booking = {
      id: nextId('bk'),
      itemId: item.id,
      itemTitle: item.title,
      itemPhoto: item.photos[0],
      lenderId: item.ownerId,
      lenderName: item.ownerName,
      borrowerId: CURRENT_USER.id,
      borrowerName: CURRENT_USER.name,
      startDate: input.startDate,
      endDate: input.endDate,
      rentalFee: price.rentalFee,
      deposit: price.deposit,
      total: price.total,
      status: 'requested',
      createdAt: now,
    };
    bookings = [booking, ...bookings];
    return delay(booking, 400);
  },

  listBookings: (opts: { userId?: string; role?: 'borrower' | 'lender' } = {}): Promise<Booking[]> => {
    const userId = opts.userId ?? CURRENT_USER.id;
    return delay(
      bookings.filter((b) =>
        opts.role === 'lender' ? b.lenderId === userId : b.borrowerId === userId
      )
    );
  },

  getBooking: (id: string): Promise<Booking> => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    return delay(booking);
  },

  setBookingStatus: (id: string, status: Booking['status']): Promise<Booking> => {
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    const updated: Booking = { ...bookings[idx], status };
    bookings = [...bookings.slice(0, idx), updated, ...bookings.slice(idx + 1)];
    return delay(updated);
  },

  acceptBooking: (id: string) => localStore.setBookingStatus(id, 'accepted'),
  declineBooking: (id: string) => localStore.setBookingStatus(id, 'declined'),
  payBooking: (id: string) => localStore.setBookingStatus(id, 'paid'),
  cancelBooking: (id: string) => localStore.setBookingStatus(id, 'cancelled'),
};

export type LocalStore = typeof localStore;

/** Test-only hook to reset mutated state back to the seed. */
export const __resetStore = (): void => {
  items = seedItemsResolved();
  bookings = seedBookings();
  blockedDates.clear();
  idCounter = 2000;
};
