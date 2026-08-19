import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private keys are stored with literal "\n" in env files; convert to real newlines.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local."
    );
  }

  return { projectId, clientEmail, privateKey };
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({
    credential: cert(loadServiceAccount()),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

let cachedApp: App | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: Storage | null = null;

function app(): App {
  if (!cachedApp) cachedApp = getAdminApp();
  return cachedApp;
}

/**
 * adminAuth/adminDb are lazy Proxies rather than eagerly-initialized
 * exports: initializing firebase-admin requires real service account
 * credentials, and Next.js imports every route module during its build-time
 * "collect page data" step (before any request ever happens). An eager
 * `initializeApp()` at module scope would crash the production build the
 * moment credentials are absent — a Proxy defers the real initialization
 * until a property is actually accessed at request time, while every
 * existing call site (`adminDb.collection(...)`) keeps working unchanged.
 */
function bindIfFunction<T extends object>(instance: T, value: unknown) {
  return typeof value === "function" ? value.bind(instance) : value;
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!cachedAuth) cachedAuth = getAuth(app());
    return bindIfFunction(cachedAuth, Reflect.get(cachedAuth, prop, cachedAuth));
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!cachedDb) cachedDb = getFirestore(app());
    return bindIfFunction(cachedDb, Reflect.get(cachedDb, prop, cachedDb));
  },
});

export const adminStorage: Storage = new Proxy({} as Storage, {
  get(_target, prop) {
    if (!cachedStorage) cachedStorage = getStorage(app());
    return bindIfFunction(cachedStorage, Reflect.get(cachedStorage, prop, cachedStorage));
  },
});
