/**
 * Public data-access surface for the app.
 *
 * Screens import from here and never touch the implementation directly. Today
 * it delegates to the in-memory `localStore`; when the Express/Firestore
 * backend is ready, swap the bodies below for `fetch` calls against
 * `https://api.campusshare.app/v1` (see PROJECT_PLAN §10) without changing any
 * screen.
 */
export { ApiError } from './localStore';
export { localStore as api } from './localStore';
