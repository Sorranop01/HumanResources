/**
 * Firebase Admin SDK Configuration for Emulator
 * Used by seed scripts to populate emulator data
 */

import admin from 'firebase-admin';

// ⚠️ IMPORTANT: Set emulator hosts BEFORE initializing Firebase
// Note: Using port 8888 to match firebase.json configuration
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8888';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize Firebase Admin for Emulator
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'human-b4c2c',
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export default admin;
