// src/services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  HISTORY: '@topup_history',
  USER_PROFILE: '@user_profile',
  FAVORITE_NUMBERS: '@favorite_numbers',
};

// ─── RIWAYAT TRANSAKSI ────────────────────────────────────────
export const saveTransaction = async (transaction) => {
  const existing = await getTransactions();
  const updated = [
    { ...transaction, id: Date.now().toString(), createdAt: new Date().toISOString() },
    ...existing,
  ];
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
};

export const getTransactions = async () => {
  const raw = await AsyncStorage.getItem(KEYS.HISTORY);
  return raw ? JSON.parse(raw) : [];
};

export const clearTransactions = async () => {
  await AsyncStorage.removeItem(KEYS.HISTORY);
};

// ─── PROFIL USER ──────────────────────────────────────────────
export const saveUserProfile = async (profile) => {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const getUserProfile = async () => {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : { name: 'Pengguna', phone: '' };
};

// ─── NOMOR FAVORIT ────────────────────────────────────────────
export const saveFavoriteNumber = async (item) => {
  const existing = await getFavoriteNumbers();
  const isDuplicate = existing.some(
    f => f.number === item.number && f.type === item.type
  );
  if (isDuplicate) return;
  const updated = [item, ...existing];
  await AsyncStorage.setItem(KEYS.FAVORITE_NUMBERS, JSON.stringify(updated));
};

export const getFavoriteNumbers = async () => {
  const raw = await AsyncStorage.getItem(KEYS.FAVORITE_NUMBERS);
  return raw ? JSON.parse(raw) : [];
};

export const removeFavoriteNumber = async (number, type) => {
  const existing = await getFavoriteNumbers();
  const updated = existing.filter(f => !(f.number === number && f.type === type));
  await AsyncStorage.setItem(KEYS.FAVORITE_NUMBERS, JSON.stringify(updated));
};

export default {
  saveTransaction,
  getTransactions,
  clearTransactions,
  saveUserProfile,
  getUserProfile,
  saveFavoriteNumber,
  getFavoriteNumbers,
  removeFavoriteNumber,
};
