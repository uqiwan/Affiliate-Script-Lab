/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocFromServer,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { HistorySession } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore (support default or custom databaseId)
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = firestoreDbId && firestoreDbId !== '(default)'
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / periksa konfigurasi Firebase.');
    }
  }
}

// Error handling conforming to Firebase integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively cleans an object for Firestore by omitting keys with undefined values,
 * because Firestore setDoc/updateDoc throws an error on undefined values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as unknown as T;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as unknown as T;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj as T;
}

// Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    // Sync basic user profile
    try {
      const userRef = doc(db, 'users', res.user.uid);
      const profileData = sanitizeForFirestore({
        userId: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || '',
        photoURL: res.user.photoURL || '',
        updatedAt: new Date().toISOString(),
      });
      await setDoc(userRef, profileData, { merge: true });
    } catch (err) {
      console.error('Failed to sync user profile:', err);
    }
    return res.user;
  } catch (popupErr: any) {
    const msg = popupErr?.message || '';
    const code = popupErr?.code || '';
    console.warn('signInWithPopup failed:', code, msg);

    // If popup is blocked or storage partition fails in mobile WebView, fallback to redirect
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request' ||
      msg.includes('missing initial state') ||
      msg.includes('sessionStorage') ||
      msg.includes('storage-partitioned')
    ) {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Membuka autentikasi Google...');
    }
    throw popupErr;
  }
}

export async function checkRedirectLogin(): Promise<User | null> {
  try {
    const res = await getRedirectResult(auth);
    if (res && res.user) {
      try {
        const userRef = doc(db, 'users', res.user.uid);
        const profileData = sanitizeForFirestore({
          userId: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || '',
          photoURL: res.user.photoURL || '',
          updatedAt: new Date().toISOString(),
        });
        await setDoc(userRef, profileData, { merge: true });
      } catch (err) {
        console.error('Failed to sync user profile from redirect:', err);
      }
      return res.user;
    }
  } catch (err) {
    console.warn('checkRedirectLogin check:', err);
  }
  return null;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// User Settings (API Key) Sync in Firestore
export async function loadUserApiKey(userId: string): Promise<string> {
  const path = `users/${userId}/settings/gemini`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'gemini'));
    if (snap.exists()) {
      return snap.data().apiKey || '';
    }
    return '';
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return '';
  }
}

export async function saveUserApiKey(userId: string, apiKey: string): Promise<void> {
  const path = `users/${userId}/settings/gemini`;
  try {
    const rawData = {
      userId,
      apiKey: (apiKey || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'settings', 'gemini'), sanitizeForFirestore(rawData));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserApiKey(userId: string): Promise<void> {
  const path = `users/${userId}/settings/gemini`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'settings', 'gemini'));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// User History Sync in Firestore
export async function loadUserHistoryFromFirestore(userId: string): Promise<HistorySession[]> {
  const path = `users/${userId}/history`;
  try {
    const colRef = collection(db, 'users', userId, 'history');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(30));
    const snap = await getDocs(q);
    const sessions: HistorySession[] = [];
    snap.forEach((d) => {
      sessions.push(d.data() as HistorySession);
    });
    return sessions;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveSessionToFirestore(
  userId: string,
  session: HistorySession
): Promise<void> {
  const path = `users/${userId}/history/${session.id}`;
  try {
    const rawData = {
      ...session,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'history', session.id), sanitizeForFirestore(rawData));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSessionFromFirestore(
  userId: string,
  sessionId: string
): Promise<void> {
  const path = `users/${userId}/history/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'history', sessionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Test connection on file evaluation
testFirestoreConnection();
