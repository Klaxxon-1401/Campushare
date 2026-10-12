import {
  AvailabilityDay,
  Booking,
  Conversation,
  Dispute,
  EvidencePhoto,
  HandoverStatus,
  Item,
  ItemDraft,
  ItemQuery,
  ItemStatus,
  Message,
  Payment,
  PaymentMethod,
  Review,
} from '../types';
import { addDays, eachDay, overlaps, todayISO } from '../utils/date';
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

// Week 7–9 collections -----------------------------------------------------------------
let payments: Payment[] = [];
let evidence: EvidencePhoto[] = [];
let reviews: Review[] = [];
let disputes: Dispute[] = [];
let conversations: Conversation[] = [];
let messages: Message[] = [];

let idCounter = 2000;
const nextId = (prefix: string): string => `${prefix}_${(idCounter++).toString(36)}${Date.now().toString(36).slice(-3)}`;

// Seed Week 7–9 state so payment / evidence / review / chat flows demo out of
// the box. All timestamps are relative to app start, so they never go stale.
(() => {
  const today = todayISO();
  const now = new Date().toISOString();
  const drafting = items.find((i) => i.id === 'it_drafting')!;
  const ti84 = items.find((i) => i.id === 'it_ti84')!;

  // Historical completed rental (drafting kit).
  const historical: Booking = {
    id: 'bk_1090',
    itemId: drafting.id,
    itemTitle: drafting.title,
    lenderId: drafting.ownerId,
    lenderName: drafting.ownerName,
    borrowerId: CURRENT_USER.id,
    borrowerName: CURRENT_USER.name,
    startDate: addDays(today, -10),
    endDate: addDays(today, -8),
    rentalFee: drafting.pricePerDay * 3,
    deposit: drafting.deposit,
    total: drafting.pricePerDay * 3 + drafting.deposit,
    status: 'returned',
    createdAt: now,
    pickupConfirmedAt: now,
    returnConfirmedAt: now,
  };
  bookings = [historical, ...bookings];
  payments.push(
    { id: 'pay_1090', bookingId: 'bk_1090', type: 'rental', amount: historical.total, method: 'upi', status: 'succeeded', ref: 'mock_txn_1090', createdAt: now },
    { id: 'pay_1091', bookingId: 'bk_1090', type: 'refund', amount: drafting.deposit, method: 'upi', status: 'refunded', ref: 'mock_refund_1091', createdAt: now }
  );
  evidence.push(
    { id: 'ev_before_1090', bookingId: 'bk_1090', stage: 'before', uri: '', note: 'Compass intact, scales clean', capturedAt: now, capturedBy: CURRENT_USER.id },
    { id: 'ev_after_1090', bookingId: 'bk_1090', stage: 'after', uri: '', note: 'Returned in same condition', capturedAt: now, capturedBy: CURRENT_USER.id }
  );

  // Active rental (TI-84) — has before evidence + an open conversation.
  evidence.push({
    id: 'ev_before_1002', bookingId: 'bk_1002', stage: 'before', uri: '',
    note: 'Screen clean, battery door closes', capturedAt: now, capturedBy: CURRENT_USER.id,
  });

  const makeConversation = (bookingId: string) => {
    const b = bookings.find((x) => x.id === bookingId)!;
    return {
      id: `conv_${bookingId}`,
      bookingId,
      itemTitle: b.itemTitle,
      memberIds: [b.lenderId, b.borrowerId] as [string, string],
      memberNames: { [b.lenderId]: b.lenderName, [b.borrowerId]: b.borrowerName },
      lastMessageAt: now,
      unreadBy: { [b.borrowerId]: 0, [b.lenderId]: 1 },
    };
  };
  conversations.push(makeConversation('bk_1090'), makeConversation('bk_1002'));
  messages.push(
    { id: 'msg_1090_1', conversationId: 'conv_bk_1090', senderId: drafting.ownerId, text: 'The drafting kit is ready for pickup at the Engineering Block. I’ll be there at 2pm.', sentAt: now },
    { id: 'msg_1090_2', conversationId: 'conv_bk_1090', senderId: CURRENT_USER.id, text: 'Great, thanks! Returning it Friday.', sentAt: now },
    { id: 'msg_1002_1', conversationId: 'conv_bk_1002', senderId: ti84.ownerId, text: 'Got it — the calculator is charged. Meet me at the Central Library desk?', sentAt: now }
  );
})();

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

  // ---- payments & deposits -------------------------------------------------

  getPaymentsForBooking: (bookingId: string): Promise<Payment[]> =>
    delay(payments.filter((p) => p.bookingId === bookingId)),

  /** Charges rental + deposit (held) once the lender accepts. Moves to `paid`. */
  payBookingAndCharge: (
    bookingId: string,
    method: PaymentMethod
  ): Promise<{ payment: Payment; booking: Booking }> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    if (booking.status !== 'accepted') {
      return Promise.reject(new ApiError('BAD_STATE', 'Booking must be accepted before payment.'));
    }
    const payment: Payment = {
      id: nextId('pay'),
      bookingId,
      type: 'rental',
      amount: booking.total,
      method,
      status: 'succeeded',
      ref: `mock_txn_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
    };
    payments = [payment, ...payments];
    const bookingIdx = bookings.findIndex((b) => b.id === bookingId);
    const paid: Booking = { ...bookings[bookingIdx], status: 'paid' };
    bookings = [...bookings.slice(0, bookingIdx), paid, ...bookings.slice(bookingIdx + 1)];
    return delay({ payment, booking: paid }, 900);
  },

  /** Lender releases the held deposit after confirming a clean return. */
  releaseDeposit: (bookingId: string, method: PaymentMethod = 'upi'): Promise<Payment> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    if (booking.status !== 'returned') {
      return Promise.reject(new ApiError('BAD_STATE', 'Deposit can only be released after return.'));
    }
    if (payments.some((p) => p.bookingId === bookingId && p.type === 'refund')) {
      return Promise.reject(new ApiError('ALREADY_RELEASED', 'Deposit already refunded.'));
    }
    const refund: Payment = {
      id: nextId('pay'),
      bookingId,
      type: 'refund',
      amount: booking.deposit,
      method,
      status: 'refunded',
      ref: `mock_refund_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
    };
    payments = [refund, ...payments];
    return delay(refund, 600);
  },

  // ---- photo evidence (condition proof) ------------------------------------

  listEvidence: (bookingId: string): Promise<EvidencePhoto[]> =>
    delay(evidence.filter((e) => e.bookingId === bookingId)),

  addEvidence: (
    bookingId: string,
    stage: EvidencePhoto['stage'],
    uri: string,
    note?: string
  ): Promise<EvidencePhoto> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    const allowed =
      stage === 'before'
        ? ['accepted', 'paid'].includes(booking.status)
        : booking.status === 'active';
    if (!allowed) {
      return Promise.reject(
        new ApiError('BAD_STATE', `"${stage}" photos can't be captured at this stage.`)
      );
    }
    if (evidence.some((e) => e.bookingId === bookingId && e.stage === stage)) {
      return Promise.reject(new ApiError('DUPLICATE', `"${stage}" photos already captured.`));
    }
    const photo: EvidencePhoto = {
      id: nextId('ev'),
      bookingId,
      stage,
      uri,
      note,
      capturedAt: new Date().toISOString(),
      capturedBy: CURRENT_USER.id,
    };
    evidence = [photo, ...evidence];
    return delay(photo, 300);
  },

  // ---- handover flow --------------------------------------------------------

  getHandoverStatus: (bookingId: string): Promise<HandoverStatus> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    const ev = evidence.filter((e) => e.bookingId === bookingId);
    const refunded = payments.some((p) => p.bookingId === bookingId && p.type === 'refund');
    const stage: HandoverStatus['stage'] =
      booking.status === 'active'
        ? 'return'
        : booking.status === 'returned'
        ? 'release'
        : 'pickup';
    return delay({
      stage,
      startDate: booking.startDate,
      endDate: booking.endDate,
      beforeCaptured: ev.some((e) => e.stage === 'before'),
      afterCaptured: ev.some((e) => e.stage === 'after'),
      depositHeld: booking.deposit > 0,
      depositAmount: booking.deposit,
      depositRefunded: refunded,
    });
  },

  /** Borrower confirms physical pickup at the meet point. */
  confirmPickup: (bookingId: string): Promise<Booking> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    if (booking.status !== 'paid') {
      return Promise.reject(new ApiError('BAD_STATE', 'Booking must be paid before pickup.'));
    }
    const idx = bookings.findIndex((b) => b.id === bookingId);
    const updated: Booking = {
      ...bookings[idx],
      status: 'active',
      pickupConfirmedAt: new Date().toISOString(),
    };
    bookings = [...bookings.slice(0, idx), updated, ...bookings.slice(idx + 1)];
    return delay(updated, 400);
  },

  /** Borrower uploads "after" photos and confirms the return. */
  confirmReturn: (bookingId: string): Promise<Booking> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    if (booking.status !== 'active') {
      return Promise.reject(new ApiError('BAD_STATE', 'Booking must be active to return.'));
    }
    if (!evidence.some((e) => e.bookingId === bookingId && e.stage === 'after')) {
      return Promise.reject(new ApiError('EVIDENCE_REQUIRED', 'Capture “after” photos first.'));
    }
    const idx = bookings.findIndex((b) => b.id === bookingId);
    const updated: Booking = {
      ...bookings[idx],
      status: 'returned',
      returnConfirmedAt: new Date().toISOString(),
    };
    bookings = [...bookings.slice(0, idx), updated, ...bookings.slice(idx + 1)];
    return delay(updated, 400);
  },

  // ---- reviews ---------------------------------------------------------------

  createReview: (bookingId: string, rating: number, comment: string): Promise<Review> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    if (booking.status !== 'returned') {
      return Promise.reject(new ApiError('BAD_STATE', 'Rate only after the rental is completed.'));
    }
    if (![booking.lenderId, booking.borrowerId].includes(CURRENT_USER.id)) {
      return Promise.reject(new ApiError('FORBIDDEN', 'Only rental parties may review.'));
    }
    if (reviews.some((r) => r.bookingId === bookingId && r.fromUserId === CURRENT_USER.id)) {
      return Promise.reject(new ApiError('DUPLICATE', 'You already reviewed this rental.'));
    }
    const toUserId = booking.lenderId === CURRENT_USER.id ? booking.borrowerId : booking.lenderId;
    const toUserName =
      booking.lenderId === CURRENT_USER.id ? booking.borrowerName : booking.lenderName;
    const review: Review = {
      id: nextId('rv'),
      bookingId,
      itemId: booking.itemId,
      fromUserId: CURRENT_USER.id,
      fromUserName: CURRENT_USER.name,
      toUserId,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    reviews = [review, ...reviews];
    return delay(review, 300);
  },

  listReviews: (opts: { toUserId?: string; fromUserId?: string } = {}): Promise<Review[]> =>
    delay(
      reviews.filter(
        (r) =>
          (!opts.toUserId || r.toUserId === opts.toUserId) &&
          (!opts.fromUserId || r.fromUserId === opts.fromUserId)
      )
    ),

  // ---- disputes ---------------------------------------------------------------

  fileDispute: (
    bookingId: string,
    reason: Dispute['reason'],
    description: string
  ): Promise<Dispute> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return Promise.reject(new ApiError('NOT_FOUND', 'Booking not found', 404));
    if (disputes.some((d) => d.bookingId === bookingId && d.status !== 'resolved')) {
      return Promise.reject(new ApiError('DUPLICATE', 'An open dispute already exists.'));
    }
    const dispute: Dispute = {
      id: nextId('dp'),
      bookingId,
      itemId: booking.itemId,
      itemTitle: booking.itemTitle,
      filedBy: CURRENT_USER.id,
      filedByName: CURRENT_USER.name,
      reason,
      description: description.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    disputes = [dispute, ...disputes];
    return delay(dispute, 300);
  },

  listDisputes: (opts: { userId?: string } = {}): Promise<Dispute[]> =>
    delay(disputes.filter((d) => !opts.userId || d.filedBy === opts.userId)),

  resolveDispute: (disputeId: string, resolution: string): Promise<Dispute> => {
    const idx = disputes.findIndex((d) => d.id === disputeId);
    if (idx === -1) return Promise.reject(new ApiError('NOT_FOUND', 'Dispute not found', 404));
    const resolved: Dispute = {
      ...disputes[idx],
      status: 'resolved',
      resolution,
      resolvedAt: new Date().toISOString(),
    };
    disputes = [...disputes.slice(0, idx), resolved, ...disputes.slice(idx + 1)];
    return delay(resolved, 300);
  },

  // ---- messaging ---------------------------------------------------------------

  ensureConversation: (bookingId: string): Conversation => {
    const existing = conversations.find((c) => c.bookingId === bookingId);
    if (existing) return existing;
    const b = bookings.find((x) => x.id === bookingId)!;
    const conv: Conversation = {
      id: `conv_${bookingId}`,
      bookingId,
      itemTitle: b.itemTitle,
      memberIds: [b.lenderId, b.borrowerId],
      memberNames: { [b.lenderId]: b.lenderName, [b.borrowerId]: b.borrowerName },
      lastMessageAt: new Date().toISOString(),
      unreadBy: { [b.lenderId]: 0, [b.borrowerId]: 0 },
    };
    conversations = [conv, ...conversations];
    return conv;
  },

  listConversations: (userId: string): Promise<Conversation[]> =>
    delay(
      conversations
        .filter((c) => c.memberIds.includes(userId))
        .slice()
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    ),

  getConversation: (conversationId: string, userId: string): Promise<{ conversation: Conversation; messages: Message[] }> => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return Promise.reject(new ApiError('NOT_FOUND', 'Conversation not found', 404));
    const idx = conversations.findIndex((c) => c.id === conversationId);
    conversations[idx] = { ...conversations[idx], unreadBy: { ...conversations[idx].unreadBy, [userId]: 0 } };
    return delay({
      conversation: conversations[idx],
      messages: messages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
    });
  },

  sendMessage: (conversationId: string, text: string, senderId: string): Promise<Message> => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return Promise.reject(new ApiError('NOT_FOUND', 'Conversation not found', 404));
    const message: Message = {
      id: nextId('msg'),
      conversationId,
      senderId,
      text: text.trim(),
      sentAt: new Date().toISOString(),
    };
    messages = [message, ...messages];
    const other = conv.memberIds.find((id) => id !== senderId);
    const idx = conversations.findIndex((c) => c.id === conversationId);
    conversations[idx] = {
      ...conversations[idx],
      lastMessageAt: message.sentAt,
      unreadBy: {
        ...conversations[idx].unreadBy,
        ...(other ? { [other]: (conversations[idx].unreadBy[other] ?? 0) + 1 } : {}),
      },
    };
    return delay(message, 200);
  },

  unreadCount: (userId: string): Promise<number> =>
    delay(
      conversations.reduce(
        (sum, c) => (c.memberIds.includes(userId) ? sum + (c.unreadBy[userId] ?? 0) : sum),
        0
      )
    ),
};

export type LocalStore = typeof localStore;

/** Test-only hook to reset mutated state back to the seed. */
export const __resetStore = (): void => {
  items = seedItemsResolved();
  bookings = seedBookings();
  blockedDates.clear();
  payments = [];
  evidence = [];
  reviews = [];
  disputes = [];
  conversations = [];
  messages = [];
  idCounter = 2000;
};
