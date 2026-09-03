import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigFile from '../firebase-applet-config.json';

const config = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || firebaseConfigFile.apiKey || '',
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfigFile.authDomain || '',
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || firebaseConfigFile.projectId || '',
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfigFile.storageBucket || '',
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfigFile.messagingSenderId || '',
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || firebaseConfigFile.appId || '',
};

export const isFirebaseConfigured: boolean = Boolean(config.apiKey && config.projectId);

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(config) : getApp();
    const customDbId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID) || firebaseConfigFile.firestoreDatabaseId;
    dbInstance = (customDbId && customDbId !== '(default)')
      ? getFirestore(appInstance, customDbId)
      : getFirestore(appInstance);
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
}

export const db: Firestore = (dbInstance || {}) as Firestore;
export default appInstance;

