/**
 * Public data-access surface for the app.
 *
 * Screens import from here and never touch the implementation directly.
 * - Items & Bookings → **network API** (protected endpoints, JWT bearer token)
 * - Payments, Evidence, Reviews, Disputes, Messages, Notifications, Admin → localStore (in-memory)
 * When the Firestore backend is ready, swap the network layer for fetch calls
 * without changing any screen.
 */

import type { LocalStore } from './localStore';
import { localStore } from './localStore';
import * as networkApi from './networkApi';
import { ItemStatus } from '../types';

/**
 * Hybrid API: network for items/bookings, local for everything else.
 * This matches the server contract (PROJECT_PLAN §10) for the two
 * resources that already have protected endpoints.
 */
export const api: LocalStore = {
  // --- Auth / current user -------------------------------------------------
  getCurrentUser: localStore.getCurrentUser,

  // --- Items (network) -----------------------------------------------------
  listItems: networkApi.listItems,
  getItem: networkApi.getItem,
  createItem: networkApi.createItem,
  updateItem: networkApi.updateItem,
  deleteItem: networkApi.deleteItem,
  setItemStatus: (id: string, status: ItemStatus) => networkApi.updateItem(id, { status }),

  // --- Availability (local - synchronous helpers used internally) ----------
  getBookedRanges: localStore.getBookedRanges,
  getBlockedDates: localStore.getBlockedDates,
  isRangeAvailable: localStore.isRangeAvailable,
  getAvailability: networkApi.getAvailability,

  // --- Bookings (network) --------------------------------------------------
  createBooking: networkApi.createBooking,
  listBookings: networkApi.listBookings,
  getBooking: networkApi.getBooking,
  setBookingStatus: networkApi.setBookingStatus,
  acceptBooking: networkApi.acceptBooking,
  declineBooking: networkApi.declineBooking,
  payBooking: networkApi.payBooking,
  cancelBooking: networkApi.cancelBooking,
  confirmPickup: networkApi.confirmPickup,
  confirmReturn: networkApi.confirmReturn,

  // --- Payments & deposits (local) -----------------------------------------
  getPaymentsForBooking: localStore.getPaymentsForBooking,
  payBookingAndCharge: localStore.payBookingAndCharge,
  releaseDeposit: localStore.releaseDeposit,

  // --- Photo evidence (local) ----------------------------------------------
  listEvidence: localStore.listEvidence,
  addEvidence: localStore.addEvidence,

  // --- Handover flow (local) -----------------------------------------------
  getHandoverStatus: localStore.getHandoverStatus,

  // --- Reviews (local) -----------------------------------------------------
  createReview: localStore.createReview,
  listReviews: localStore.listReviews,

  // --- Disputes (local) ----------------------------------------------------
  fileDispute: localStore.fileDispute,
  listDisputes: localStore.listDisputes,
  resolveDispute: localStore.resolveDispute,

  // --- Messaging (local) ---------------------------------------------------
  ensureConversation: localStore.ensureConversation,
  listConversations: localStore.listConversations,
  getConversation: localStore.getConversation,
  sendMessage: localStore.sendMessage,
  unreadCount: localStore.unreadCount,

  // --- Notifications (local) -----------------------------------------------
  listNotifications: localStore.listNotifications,
  unreadNotificationCount: localStore.unreadNotificationCount,
  markNotificationRead: localStore.markNotificationRead,
  markAllNotificationsRead: localStore.markAllNotificationsRead,

  // --- Admin / moderation (local) ------------------------------------------
  listUsers: localStore.listUsers,
  setUserVerification: localStore.setUserVerification,
  getAnalytics: localStore.getAnalytics,
};

export type Api = typeof api;
export { ApiError } from './localStore';