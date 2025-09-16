
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Initialize without credentials for client-side usage or if env var is not set.
    // This will have limited permissions.
    admin.initializeApp();
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
