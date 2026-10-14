import { AvailabilityDay, Booking, BookingStatus, Item, ItemCategory, ItemStatus, User, UserRecord, UserRole, VerificationStatus } from '../types';
import { addDays, daysInclusive, eachDay, overlaps, todayISO } from '../utils/date';
import { hashPasswordSync } from '../services/passwords';

// In-memory persistence layer. Replaced by Firestore at the End-of-Week-6
// integration step (PROJECT_PLAN §9). State intentionally lives in this module
// only, so swapping storage does not touch route/controller code.

let idCounter = 5000;
const nextId = (prefix: string): string =>
  `${prefix}_${(idCounter++).toString(36)}${Date.now().toString(36).slice(-3)}`;

const nowISO = () => new Date().toISOString();

export interface SeedUser {
  id: string;
  name: string;
  role: 'student' | 'admin';
  rating: number;
  reviewCount: number;
  email: string;
  studentId?: string;
}

export const SEED_USERS: SeedUser[] = [
  { id: 'u_devan', name: 'Devan D', role: 'student', rating: 4.9, reviewCount: 12, email: 'devan.d@student.university.edu', studentId: '22CS1042' },
  { id: 'u_avisar', name: 'Avisar Anand', role: 'student', rating: 4.8, reviewCount: 9, email: 'avisar.a@student.university.edu', studentId: '22CS1102' },
  { id: 'u_anmol', name: 'Anmol Kumar', role: 'student', rating: 4.7, reviewCount: 6, email: 'anmol.k@student.university.edu', studentId: '22EC2087' },
  { id: 'u_sarah', name: 'Sarah M.', role: 'student', rating: 4.9, reviewCount: 21, email: 'sarah.m@student.university.edu', studentId: '21CH3005' },
  { id: 'u_mike', name: 'Mike R.', role: 'student', rating: 4.6, reviewCount: 14, email: 'mike.r@student.university.edu', studentId: '23ME1188' },
  { id: 'u_lisa', name: 'Lisa K.', role: 'student', rating: 4.5, reviewCount: 8, email: 'lisa.k@student.university.edu', studentId: '23BT4021' },
  { id: 'u_priya', name: 'Priya S.', role: 'student', rating: 4.8, reviewCount: 11, email: 'priya.s@student.university.edu', studentId: '21CS2090' },
  { id: 'u_admin', name: 'Campus Admin', role: 'admin', rating: 5, reviewCount: 0, email: 'admin@university.edu' },
];

/** Password shared by all seeded demo accounts. Documented for local testing. */
export const SEED_PASSWORD = 'campus1234';

interface SeedDef {
  id: string;
  ownerId: string;
  title: string;
  category: ItemCategory;
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  status: ItemStatus;
  conditionNote?: string;
}

const SEED_ITEMS: SeedDef[] = [
  { id: 'it_labcoat', ownerId: 'u_sarah', title: 'Chemistry Lab Coat (Size M)', category: 'academic',
    description: 'Standard cotton lab coat in good condition. Washed after every use. Fits size M comfortably.',
    pricePerDay: 3, deposit: 10, location: 'North Campus', status: 'published',
    conditionNote: 'Minor ink mark on left sleeve, otherwise clean.' },
  { id: 'it_ti84', ownerId: 'u_avisar', title: 'TI-84 Graphing Calculator', category: 'electronics',
    description: 'TI-84 Plus with all functions working. Batteries included. Great for exams and stats labs.',
    pricePerDay: 5, deposit: 25, location: 'Central Library', status: 'published',
    conditionNote: 'Light scuffs on the sliding cover.' },
  { id: 'it_blazer', ownerId: 'u_mike', title: 'Interview Blazer (Navy, 38R)', category: 'clothing',
    description: 'Formal navy blazer, dry-cleaned. Perfect for interviews, presentations and convocation.',
    pricePerDay: 8, deposit: 30, location: 'South Dorms', status: 'published' },
  { id: 'it_dumbbells', ownerId: 'u_lisa', title: '20lb Dumbbell Set', category: 'fitness',
    description: 'Pair of 20lb dumbbells. Great for a short strength block. Pickup at the sports complex.',
    pricePerDay: 4, deposit: 15, location: 'Sports Complex', status: 'published' },
  { id: 'it_drafting', ownerId: 'u_anmol', title: 'Drafting Toolkit (Compass + Scales)', category: 'academic',
    description: 'Full geometry and drafting set: compass, set squares, protractor and scale rulers.',
    pricePerDay: 4, deposit: 20, location: 'Engineering Block', status: 'published' },
  { id: 'it_calc991', ownerId: 'u_sarah', title: 'Scientific Calculator FX-991', category: 'electronics',
    description: 'Casio FX-991EX. Approved for most engineering exams. Comes with a hard case.',
    pricePerDay: 3, deposit: 15, location: 'Central Library', status: 'published' },
  { id: 'it_gown', ownerId: 'u_priya', title: 'Graduation Gown (Size L)', category: 'clothing',
    description: 'Full graduation set — gown, cap and hood. Fits size L. Ideal for convocation photos.',
    pricePerDay: 10, deposit: 40, location: 'South Dorms', status: 'published' },
  { id: 'it_yoga', ownerId: 'u_lisa', title: 'Yoga Mat + Blocks', category: 'fitness',
    description: '6mm anti-slip yoga mat with two foam blocks and a carry strap.',
    pricePerDay: 3, deposit: 12, location: 'Sports Complex', status: 'published' },
  { id: 'it_casio', ownerId: 'u_devan', title: 'Casio FX-991EX Calculator', category: 'electronics',
    description: 'My spare scientific calculator. Kept in a case, works perfectly.',
    pricePerDay: 3, deposit: 15, location: 'Engineering Block', status: 'published' },
  { id: 'it_fieldkit', ownerId: 'u_devan', title: 'Survey Field Kit', category: 'other',
    description: 'Measuring tape, levelling staff and pegs for surveying labs.',
    pricePerDay: 5, deposit: 20, location: 'Engineering Block', status: 'draft' },
];

export const RESERVING_STATUSES: BookingStatus[] = ['requested', 'accepted', 'paid', 'active', 'returned', 'disputed'];
export const MAX_RENTAL_DAYS = 30;

export interface ItemDraftInput {
  title: string;
  category: ItemCategory;
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  conditionNote?: string;
  photos?: string[];
}

interface StoredItem extends Item {}

let items: StoredItem[] = SEED_ITEMS.map((s) => {
  const owner = SEED_USERS.find((u) => u.id === s.ownerId)!;
  return {
    ...s,
    ownerName: owner.name,
    ownerVerified: true,
    ownerRating: owner.rating,
    photos: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
});

let bookings: Booking[] = [];
const blockedDates = new Map<string, Set<string>>();

// Seeded accounts are pre-verified so the app can log in immediately.
const seedPasswordHash = hashPasswordSync(SEED_PASSWORD);
const seedUserRecords = (): UserRecord[] =>
  SEED_USERS.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    studentId: u.studentId,
    role: u.role,
    verificationStatus: 'verified' as VerificationStatus,
    rating: u.rating,
    reviewCount: u.reviewCount,
    createdAt: nowISO(),
    passwordHash: seedPasswordHash,
  }));

let users: UserRecord[] = seedUserRecords();

const userOf = (id: string) => SEED_USERS.find((u) => u.id === id);

export const store = {
  findItem(id: string): StoredItem | undefined {
    return items.find((i) => i.id === id);
  },

  listItems(opts: {
    q?: string; category?: string; location?: string; ownerId?: string;
    includeDrafts?: boolean; page?: number; limit?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
    let result = items.filter((i) => {
      // Drafts (and any non-published item) are private unless explicitly requested.
      if (!opts.includeDrafts && i.status !== 'published') return false;
      if (opts.ownerId && i.ownerId !== opts.ownerId) return false;
      if (opts.category && opts.category !== 'all' && i.category !== opts.category) return false;
      if (opts.location && i.location !== opts.location) return false;
      const q = opts.q?.trim().toLowerCase();
      if (q) {
        const haystack = `${i.title} ${i.description} ${i.location} ${i.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const total = result.length;
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);
    return { items: result, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  createItem(input: ItemDraftInput, ownerId: string): StoredItem {
    const owner = userOf(ownerId) ?? userOf('u_devan')!;
    const item: StoredItem = {
      id: nextId('it'),
      ...input,
      photos: input.photos ?? [],
      ownerId: owner.id,
      ownerName: owner.name,
      ownerVerified: true,
      ownerRating: owner.rating,
      status: 'draft',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    items = [item, ...items];
    return item;
  },

  updateItem(id: string, patch: Partial<StoredItem>): StoredItem | undefined {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    const updated: StoredItem = { ...items[idx], ...patch, updatedAt: nowISO() };
    items = [...items.slice(0, idx), updated, ...items.slice(idx + 1)];
    return updated;
  },

  deleteItem(id: string): boolean {
    const before = items.length;
    items = items.filter((i) => i.id !== id);
    return items.length < before;
  },

  setItemStatus(id: string, status: ItemStatus): Item | undefined {
    return store.updateItem(id, { status });
  },

  // ---- availability --------------------------------------------------------

  getBookedRanges(itemId: string): Array<{ start: string; end: string }> {
    return bookings
      .filter((b) => b.itemId === itemId && RESERVING_STATUSES.includes(b.status))
      .map((b) => ({ start: b.startDate, end: b.endDate }));
  },

  getBlockedDates(itemId: string): string[] {
    return Array.from(blockedDates.get(itemId) ?? []);
  },

  isRangeAvailable(itemId: string, start: string, end: string): boolean {
    const blocked = blockedDates.get(itemId);
    if (blocked) {
      for (const d of eachDay(start, end)) {
        if (blocked.has(d)) return false;
      }
    }
    return !store.getBookedRanges(itemId).some((r) => overlaps(start, end, r.start, r.end));
  },

  getAvailability(itemId: string, year: number, month: number): AvailabilityDay[] {
    const blocked = blockedDates.get(itemId) ?? new Set<string>();
    const ranges = store.getBookedRanges(itemId);
    const days: AvailabilityDay[] = [];
    const last = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= last; day++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let state: AvailabilityDay['state'] = 'open';
      if (blocked.has(iso)) state = 'blocked';
      else if (ranges.some((r) => iso >= r.start && iso <= r.end)) state = 'booked';
      days.push({ date: iso, state });
    }
    return days;
  },

  // ---- bookings ------------------------------------------------------------

  getBooking(id: string): Booking | undefined {
    return bookings.find((b) => b.id === id);
  },

  listBookings(opts: { userId?: string; lender?: boolean }): Booking[] {
    return bookings.filter((b) =>
      opts.lender ? b.lenderId === opts.userId : b.borrowerId === opts.userId
    );
  },

  createBooking(input: { itemId: string; startDate: string; endDate: string }, borrowerId: string): Booking | { error: string } {
    const item = store.findItem(input.itemId);
    if (!item) return { error: 'Item not found' };
    if (item.status !== 'published') return { error: 'This item is not currently available.' };
    if (input.startDate < todayISO()) return { error: 'The start date cannot be in the past.' };
    if (input.endDate < input.startDate) return { error: 'The end date must be on or after the start date.' };
    const days = daysInclusive(input.startDate, input.endDate);
    if (days > MAX_RENTAL_DAYS) return { error: `Rentals can be at most ${MAX_RENTAL_DAYS} days.` };
    if (!store.isRangeAvailable(item.id, input.startDate, input.endDate)) {
      return { error: 'Those dates are already booked. Please pick another range.' };
    }
    const borrower = userOf(borrowerId) ?? userOf('u_devan')!;
    const rentalFee = item.pricePerDay * days;
    const booking: Booking = {
      id: nextId('bk'),
      itemId: item.id,
      itemTitle: item.title,
      itemPhoto: item.photos[0],
      lenderId: item.ownerId,
      lenderName: item.ownerName,
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      startDate: input.startDate,
      endDate: input.endDate,
      rentalFee,
      deposit: item.deposit,
      total: rentalFee + item.deposit,
      status: 'requested',
      createdAt: nowISO(),
    };
    bookings = [booking, ...bookings];
    return booking;
  },

  setBookingStatus(id: string, status: BookingStatus): Booking | undefined {
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    const updated: Booking = { ...bookings[idx], status };
    bookings = [...bookings.slice(0, idx), updated, ...bookings.slice(idx + 1)];
    return updated;
  },

  // --- Users / auth (PROJECT_PLAN §11.1) ---

  findUserById(id: string): UserRecord | undefined {
    return users.find((u) => u.id === id);
  },

  findUserByEmail(email: string): UserRecord | undefined {
    const target = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === target);
  },

  createUser(input: {
    name: string;
    email: string;
    studentId?: string;
    passwordHash: string;
    role?: UserRole;
    verificationStatus?: VerificationStatus;
  }): UserRecord {
    const record: UserRecord = {
      id: nextId('u'),
      name: input.name,
      email: input.email.trim().toLowerCase(),
      studentId: input.studentId,
      role: input.role ?? 'student',
      verificationStatus: input.verificationStatus ?? 'pending',
      rating: 0,
      reviewCount: 0,
      createdAt: nowISO(),
      passwordHash: input.passwordHash,
    };
    users = [record, ...users];
    return record;
  },

  updateUser(
    id: string,
    patch: Partial<Omit<UserRecord, 'id' | 'passwordHash'>> & { passwordHash?: string }
  ): UserRecord | undefined {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    const updated: UserRecord = { ...users[idx], ...patch };
    users = [...users.slice(0, idx), updated, ...users.slice(idx + 1)];
    return updated;
  },

  setUserVerification(id: string, status: VerificationStatus): UserRecord | undefined {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    const updated: UserRecord = { ...users[idx], verificationStatus: status };
    users = [...users.slice(0, idx), updated, ...users.slice(idx + 1)];
    return updated;
  },

  /** Test/development helper: full store reset (incl. ephemeral account purge). */
  __resetStore(): void {
    __resetStore();
  },
};

/** Strips credentials so a UserRecord can be sent over the wire. */
export const toPublicUser = (record: UserRecord): User => {
  const { passwordHash: _passwordHash, ...publicUser } = record;
  return publicUser;
};

/** Test/development helper. */
export const __resetStore = (): void => {
  items = SEED_ITEMS.map((s) => {
    const owner = SEED_USERS.find((u) => u.id === s.ownerId)!;
    return {
      ...s, ownerName: owner.name, ownerVerified: true, ownerRating: owner.rating,
      photos: [], createdAt: nowISO(), updatedAt: nowISO(),
    };
  });
  bookings = [];
  blockedDates.clear();
  users = seedUserRecords();
  idCounter = 5000;

  // Edge case: devanduraipragash@gmail.com is an ephemeral demo account.
  // It gets removed on every store reset (server restart) so you always start fresh.
  const ephemeralEmails = [
    'devanduraipragash@gmail.com',
    '25cu0310065@student.hindustanuniv.ac.in',
  ];
  for (const email of ephemeralEmails) {
    const idx = users.findIndex((u) => u.email === email);
    if (idx !== -1) {
      users.splice(idx, 1);
    }
  }
};

export { addDays };