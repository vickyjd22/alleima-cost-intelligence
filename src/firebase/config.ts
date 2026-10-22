import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'dev-placeholder',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'dev-placeholder',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'dev-placeholder',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'dev-placeholder',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID ?? 'dev-placeholder',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'dev-placeholder',
};

export const app = getApps().length === 0 ? initializeApp(config) : getApps()[0]!;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
