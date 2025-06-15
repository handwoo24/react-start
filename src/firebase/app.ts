import type { FirebaseOptions } from "firebase/app";
import { getApps, initializeApp } from "firebase/app";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const options: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app =
  getApps().find((app) => app.name === options.projectId) ||
  initializeApp(options);

export const storage = getStorage(app);

if (process.env.NODE_ENV === "development") {
  connectStorageEmulator(storage, "localhost", 9199);
}
