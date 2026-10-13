import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Persists the auth JWT. Prefers the OS keystore via expo-secure-store and
 * falls back to AsyncStorage where secure storage isn't available (e.g. web).
 */

const KEY = 'campusshare.auth.token';
const USER_KEY = 'campusshare.auth.user';

const secureAvailable = async (): Promise<boolean> => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const saveToken = async (token: string): Promise<void> => {
  if (await secureAvailable()) return SecureStore.setItemAsync(KEY, token);
  await AsyncStorage.setItem(KEY, token);
};

export const loadToken = async (): Promise<string | null> => {
  if (await secureAvailable()) return SecureStore.getItemAsync(KEY);
  return AsyncStorage.getItem(KEY);
};

export const clearToken = async (): Promise<void> => {
  if (await secureAvailable()) return SecureStore.deleteItemAsync(KEY);
  await AsyncStorage.removeItem(KEY);
};

/** Caches the last signed-in user's profile (non-sensitive) for offline launch. */
export const saveUser = async (user: unknown): Promise<void> => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const loadUser = async <T>(): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const clearUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_KEY);
};
