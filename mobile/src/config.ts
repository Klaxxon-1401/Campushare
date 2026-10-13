/**
 * App configuration.
 *
 * The API base URL can be overridden at build time with EXPO_PUBLIC_API_URL
 * (Expo inlines EXPO_PUBLIC_* variables). Defaults to the Android emulator's
 * host loopback, where a locally running API is reachable.
 *
 *   Physical device  →  EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3000/v1
 *   Android emulator →  http://10.0.2.2:3000/v1  (default)
 *   iOS simulator    →  http://localhost:3000/v1
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/v1'
).replace(/\/+$/, '');
