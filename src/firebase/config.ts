import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const credential = cert({
  privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
});

let app = getApps().at(0);

if (!app) {
  app = initializeApp({ credential });
  getFirestore(app).settings({ ignoreUndefinedProperties: true });
}

export const firestore = getFirestore(app);
