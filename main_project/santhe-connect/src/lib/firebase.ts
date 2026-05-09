import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  indexedDBLocalPersistence,
  signInWithCredential
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Use indexedDB persistence for better support in Capacitor/Mobile apps
setPersistence(auth, indexedDBLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

export const googleProvider = new GoogleAuthProvider();

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile };

export async function signInWithGoogle() {
  try {
    const isMobileApp = window.location.origin.includes('localhost') || 
                       window.location.origin.includes('capacitor') ||
                       window.location.protocol === 'file:';
    
    if (isMobileApp) {
      console.log("Mobile app context, using Capacitor Firebase Authentication...");
      const result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
      if (!result.credential) {
        throw new Error("No credential returned from Google Sign-In");
      }
      const credential = GoogleAuthProvider.credential(result.credential.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }

    console.log("Web context, using Popup...");
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Sign-In failed:", error);
    
    if (error.code === 'auth/operation-not-allowed') {
      alert("Error: Google Sign-In is not enabled. Please check Firebase Console > Authentication.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.log("Popup cancelled, retrying with redirect...");
      await signInWithRedirect(auth, googleProvider);
      return null;
    } else {
      alert("Sign-in failed: " + error.message);
    }
    throw error;
  }
}

/**
 * Checks for a user result after a redirect-based sign-in.
 * Should be called when the app starts.
 */
export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Google Sign-In successful after redirect");
      return result.user;
    }
  } catch (error: any) {
    console.error("Error getting redirect result:", error);
  }
  return null;
}

// Connection test as required by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
