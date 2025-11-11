/**
 * Environment configuration loader
 * Wraps Vite's import.meta.env for type-safe access
 */

interface EnvConfig {
  readonly FIREBASE_API_KEY: string;
  readonly FIREBASE_AUTH_DOMAIN: string;
  readonly FIREBASE_PROJECT_ID: string;
  readonly FIREBASE_STORAGE_BUCKET: string;
  readonly FIREBASE_MESSAGING_SENDER_ID: string;
  readonly FIREBASE_APP_ID: string;
  readonly ENV: 'development' | 'staging' | 'production';
}

function loadEnv(): EnvConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const environment = import.meta.env.VITE_ENV || 'development';

  // Validation
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    throw new Error(
      'Missing required Firebase environment variables. Please check your .env.development file.'
    );
  }

  return {
    FIREBASE_API_KEY: apiKey,
    FIREBASE_AUTH_DOMAIN: authDomain,
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_STORAGE_BUCKET: storageBucket,
    FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    FIREBASE_APP_ID: appId,
    ENV: environment as EnvConfig['ENV'],
  };
}

export const env = loadEnv();

// Type augmentation for import.meta.env
declare global {
  interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_ENV?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
