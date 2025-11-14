import { getApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK (idempotent - safe to call multiple times)
try {
  getApp(); // Check if app already exists
} catch {
  initializeApp(); // Only initialize if app doesn't exist
}

// Export instances
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

// Set Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});
