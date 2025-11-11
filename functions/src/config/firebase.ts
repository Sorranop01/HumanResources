import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
initializeApp();

// Export instances
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

// Set Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});
