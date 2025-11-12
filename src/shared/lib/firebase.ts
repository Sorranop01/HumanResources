import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, type Firestore, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, type Functions, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, type FirebaseStorage, getStorage } from 'firebase/storage';
import { env } from '@/env';

// Firebase configuration
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'asia-southeast1');

  // Connect to emulators in development
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectStorageEmulator(storage, 'localhost', 9199);
    // eslint-disable-next-line no-console
    console.log('🔧 Firebase connected to emulators');
  }

  // eslint-disable-next-line no-console
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { app, auth, db, functions, storage };
