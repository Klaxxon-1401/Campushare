// Domain types for CampusShare.
// Mirrors the Firestore collections defined in PROJECT_PLAN.md §9 so that the
// local store used during development can be swapped for the API/Firestore
// without touching screens.

export type ItemCategory =
  | 'academic'
  | 'clothing'
  | 'electronics'
  | 'fitness'
  | 'other';

export type ItemStatus = 'draft' | 'published' | 'booked' | 'inactive';

export type PhotoKind = 'primary' | 'gallery' | 'condition';

export type AvailabilityState = 'open' | 'booked' | 'blocked';

export type UserRole = 'student' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  campusEmail: string;
  studentId?: string;
  verificationStatus: VerificationStatus;
  role: UserRole;
  rating: number;
  reviewCount: number;
}

export interface ItemPhoto {
  id: string;
  url: string;
  kind: PhotoKind;
}

export interface Item {
  id: string;
  ownerId: string;
  /** Denormalised for feed rendering. */
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
  /** YYYY-MM-DD */
  date: string;
  state: AvailabilityState;
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'paid'
  | 'active'
  | 'returned'
  | 'disputed'
  | 'cancelled';

export interface Booking {
  id: string;
  itemId: string;
  /** Denormalised so booking lists render without a second lookup. */
  itemTitle: string;
  itemPhoto?: string;
  lenderId: string;
  lenderName: string;
  borrowerId: string;
  borrowerName: string;
  /** YYYY-MM-DD (inclusive) */
  startDate: string;
  /** YYYY-MM-DD (inclusive) */
  endDate: string;
  /** pricePerDay × days (integer days, inclusive of both endpoints). */
  rentalFee: number;
  deposit: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
  pickupConfirmedAt?: string;
  returnConfirmedAt?: string;
}

export interface PriceBreakdown {
  days: number;
  rentalFee: number;
  deposit: number;
  total: number;
}

export interface ItemDraft {
  title: string;
  category: ItemCategory;
  description: string;
  pricePerDay: number;
  deposit: number;
  location: string;
  conditionNote?: string;
  photos: string[];
}

export interface ItemQuery {
  q?: string;
  category?: ItemCategory | 'all';
  location?: string;
  ownerId?: string;
  includeDrafts?: boolean;
}

// ---- Week 7–9: payments, evidence, trust & messaging -----------------------

export type PaymentMethod = 'upi' | 'card' | 'wallet';
export type PaymentType = 'rental' | 'refund';

export interface Payment {
  id: string;
  bookingId: string;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  status: 'succeeded' | 'refunded' | 'failed';
  ref: string;
  createdAt: string;
}

export type EvidenceStage = 'before' | 'after';

export interface EvidencePhoto {
  id: string;
  bookingId: string;
  stage: EvidenceStage;
  uri: string;
  note?: string;
  capturedAt: string;
  capturedBy: string;
}

export interface Review {
  id: string;
  bookingId: string;
  itemId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
}

export type DisputeReason = 'damage' | 'returned-late' | 'not-returned' | 'other';
export type DisputeStatus = 'open' | 'under-review' | 'resolved';

export interface Dispute {
  id: string;
  bookingId: string;
  itemId: string;
  itemTitle: string;
  filedBy: string;
  filedByName: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  bookingId: string;
  itemTitle: string;
  memberIds: [string, string];
  memberNames: Record<string, string>;
  lastMessageAt: string;
  unreadBy: Record<string, number>;
}

export interface HandoverStatus {
  stage: 'pickup' | 'active' | 'return' | 'release';
  startDate: string;
  endDate: string;
  beforeCaptured: boolean;
  afterCaptured: boolean;
  depositHeld: boolean;
  depositAmount: number;
  depositRefunded: boolean;
}
