import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./config";

// GoogleAuthProvider tells Firebase Auth to use Google as the identity provider
const googleProvider = new GoogleAuthProvider();

// Opens a Google sign-in popup. signInWithRedirect is an alternative for mobile browsers.
export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOut() {
  return firebaseSignOut(getFirebaseAuth());
}

// onAuthStateChanged fires whenever the user signs in, signs out, or the session refreshes.
// Returns an unsubscribe function — call it in useEffect cleanup to avoid memory leaks.
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
