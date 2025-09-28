import type { UserShareEncryptionKeys } from '@ika.xyz/sdk';

// Simple in-memory store + optional localStorage persistence for the demo dashboard.
let currentKeys: UserShareEncryptionKeys | null = null;
const LS_KEY = 'ika.userShareEncryptionKeys';

export function setUserShareEncryptionKeys(keys: UserShareEncryptionKeys | null, persist = false) {
  currentKeys = keys;
  if (persist && keys) {
    try {
      const bytes = keys.toShareEncryptionKeysBytes();
      const arr = Array.from(bytes);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to persist keys', e);
    }
  } else if (!keys) {
    localStorage.removeItem(LS_KEY);
  }
}

export function getUserShareEncryptionKeys(): UserShareEncryptionKeys | null {
  return currentKeys;
}

export function tryLoadPersistedKeys(factory: (bytes: Uint8Array) => UserShareEncryptionKeys) {
  if (currentKeys) return currentKeys;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw) as number[];
    const bytes = new Uint8Array(arr);
    currentKeys = factory(bytes);
    return currentKeys;
  } catch (e) {
    console.warn('Failed to restore persisted keys', e);
    return null;
  }
}
