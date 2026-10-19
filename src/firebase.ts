/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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

// Auth Helpers
export async function loginWithGoogle(): Promise<User> {
  const res = await signInWithPopup(auth, googleProvider);
  // Sync basic user profile
  try {
    const userRef = doc(db, 'users', res.user.uid);
    await setDoc(
      userRef,
      {
        userId: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || '',
        photoURL: res.user.photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync user profile:', err);
  }
  return res.user;
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
    await setDoc(doc(db, 'users', userId, 'settings', 'gemini'), {
      userId,
      apiKey: apiKey.trim(),
      updatedAt: new Date().toISOString(),
    });
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
    await setDoc(doc(db, 'users', userId, 'history', session.id), {
      ...session,
      userId,
      updatedAt: new Date().toISOString(),
    });
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
