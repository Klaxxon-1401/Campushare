// Shared domain types for the CampusShare API.
// These mirror `mobile/src/types` — the single source of truth for the wire
// contract is the API contract in docs/week-04/api-contract-v1.md.

export type ItemCategory = 'academic' | 'clothing' | 'electronics' | 'fitness' | 'other';
export type ItemStatus = 'draft' | 'published' | 'booked' | 'inactive';
export type AvailabilityState = 'open' | 'booked' | 'blocked';
export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'paid'
  | 'active'
  | 'returned'
  | 'disputed'
  | 'cancelled';

export interface Item {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerVerified: boolean;
  ownerRating: number;
  title: string;
  category: ItemCategory;
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  status: ItemStatus;
  conditionNote?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityDay {
  date: string;
  state: AvailabilityState;
}

export interface Booking {
  id: string;
  itemId: string;
  itemTitle: string;
  itemPhoto?: string;
  lenderId: string;
  lenderName: string;
  borrowerId: string;
  borrowerName: string;
  startDate: string;
  endDate: string;
  rentalFee: number;
  deposit: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
  pickupConfirmedAt?: string;
  returnConfirmedAt?: string;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// ---------------------------------------------------------------------------
// Auth (PROJECT_PLAN §11.1). Wire contract mirrored in the mobile app.
// ---------------------------------------------------------------------------

export type UserRole = 'student' | 'admin';
export type VerificationStatus = 'draft' | 'pending' | 'verified' | 'rejected';

/** Public user shape returned to clients — never contains credentials. */
export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

/** Internal record. `passwordHash` must never be returned to a client. */
export interface UserRecord extends User {
  passwordHash: string;
}

/** JWT claims (docs/week-03/api-contract-v1.md §1). */
export interface JwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  iat?: number;
  exp?: number;
}