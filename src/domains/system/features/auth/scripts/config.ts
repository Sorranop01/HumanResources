/**
 * Firebase configuration for Node.js scripts
 * Uses process.env instead of import.meta.env
 */

import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load .env.development file
config({ path: resolve(process.cwd(), '.env.development') });

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Get Firebase config from environment variables
 */
export function getFirebaseConfig(): FirebaseConfig {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    throw new Error(
      'Missing Firebase environment variables. Make sure .env.development exists and contains all required VITE_FIREBASE_* variables.'
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

/**
 * Initialize Firebase for Node.js scripts
 */
export async function initializeFirebaseForScript() {
  const { initializeApp } = await import('firebase/app');
  const { getAuth, connectAuthEmulator } = await import('firebase/auth');
  const { getFirestore, connectFirestoreEmulator } = await import('firebase/firestore');

  const config = getFirebaseConfig();
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Connect to emulators if FIREBASE_EMULATOR is set
  if (process.env.FIREBASE_EMULATOR === 'true') {
    console.log('🔧 Connecting to Firebase Emulators...');
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8888);
    console.log('✅ Connected to emulators\n');
  }

  return { auth, db };
}
