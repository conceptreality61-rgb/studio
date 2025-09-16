
import * as admin from 'firebase-admin';

// This is a server-only file. It should not be imported on the client.

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
     console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    // This error will be thrown during the build process or on server start-up,
    // making it clear that the environment is not configured correctly.
    throw new Error(`Firebase Admin SDK Initialization Error: ${error.message}. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in your environment.`);
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
