import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function env(key: string) {
  return (import.meta.env[key] || '').trim();
}

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.appId,
);

function initDb(app: NonNullable<typeof firebaseApp>) {
  // Schedules (and other optional fields) use `undefined` for "not set" (e.g. an
  // all-day schedule has no startTime/endTime). Firestore rejects `undefined`
  // field values by default, which silently fails the whole document write —
  // ignoreUndefinedProperties makes it drop those fields instead of erroring.
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    // Already initialized (e.g. Vite HMR re-running this module) — reuse it.
    return getFirestore(app);
  }
}

export const firebaseApp = isFirebaseConfigured ? (getApps()[0] || initializeApp(firebaseConfig)) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? initDb(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;
