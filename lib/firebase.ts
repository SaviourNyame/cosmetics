import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Lazy singletons rather than eager module-scope initialization: "use
 * client" components still render once on the server during prerendering,
 * so an eager `getAuth()` call here would run at build time and throw if
 * NEXT_PUBLIC_FIREBASE_* isn't available in that environment — taking down
 * the static build of any page that merely imports this module, even ones
 * that don't call Firebase until a real user interacts with them in the
 * browser. Deferring initialization until first actual use confines any
 * missing-config failure to the moment a client genuinely needs it.
 */
let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;

function app(): FirebaseApp {
  if (!cachedApp) cachedApp = getApps()[0] ?? initializeApp(firebaseConfig);
  return cachedApp;
}

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) cachedAuth = getAuth(app());
  return cachedAuth;
}

export function getFirestoreDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(app());
  return cachedDb;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!cachedStorage) cachedStorage = getStorage(app());
  return cachedStorage;
}
