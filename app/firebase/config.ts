import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase web app config. Copy from Firebase Console → Project settings → Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Optional. Set VITE_ENABLE_STORAGE=false in .env to skip image uploads.
export const storageEnabled =
  import.meta.env.VITE_ENABLE_STORAGE !== "false";

// Browser-only. Deferred init avoids SSR/prerender crashes.
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function initFirebase() {
  if (typeof window === "undefined") return;
  if (app) return;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  if (storageEnabled) {
    storage = getStorage(app);
  }
}

export function getFirebaseAuth(): Auth {
  initFirebase();
  if (!auth) throw new Error("Firebase Auth is only available in the browser");
  return auth;
}

export function getFirestoreDb(): Firestore {
  initFirebase();
  if (!db) throw new Error("Firestore is only available in the browser");
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  initFirebase();
  return storage ?? null;
}
