/**
 * MoodBook — Firebase initialisation
 */

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Warn loudly in dev if config is missing
if (import.meta.env.DEV && !firebaseConfig.databaseURL) {
  console.error(
    '🔥 [MoodBook] VITE_FIREBASE_DATABASE_URL is missing!\n' +
    'Create a .env file, see .env.example for instructions.'
  );
}

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
