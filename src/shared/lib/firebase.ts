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
  ...(env.FIREBASE_MEASUREMENT_ID && { measurementId: env.FIREBASE_MEASUREMENT_ID }),
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

// Flag to prevent multiple emulator connections
let isEmulatorConnected = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'asia-southeast1');

  // Connect to emulators in development
  // Use multiple checks to ensure we're in dev mode
  const isDev =
    import.meta.env.DEV || import.meta.env.MODE === 'development' || env.ENV === 'development';

  if (isDev && !isEmulatorConnected) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8888);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      connectStorageEmulator(storage, 'localhost', 9199);
      isEmulatorConnected = true;
      // eslint-disable-next-line no-console
      console.log('🔧 Firebase connected to emulators');
      // eslint-disable-next-line no-console
      console.log('   - Auth Emulator: http://localhost:9099');
      // eslint-disable-next-line no-console
      console.log('   - Firestore Emulator: localhost:8888');
      // eslint-disable-next-line no-console
      console.log('   - Functions Emulator: localhost:5001');
      // eslint-disable-next-line no-console
      console.log('   - Storage Emulator: localhost:9199');
    } catch (emulatorError) {
      // Ignore errors from trying to connect to emulators multiple times
      if (
        emulatorError instanceof Error &&
        !emulatorError.message.includes('already been called')
      ) {
        console.error('⚠️ Failed to connect to emulators:', emulatorError);
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { app, auth, db, functions, storage };
