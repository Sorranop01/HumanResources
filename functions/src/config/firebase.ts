import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export instances
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Set Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

// Export admin for advanced usage
export { admin };
