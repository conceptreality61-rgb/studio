
'use server';

import * as admin from 'firebase-admin';

// This is a server-only file. It should not be imported on the client.

// Check if the service account key is available in environment variables
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // In a real production environment, you would want to handle this more gracefully.
  // For this context, we will log a warning. In many environments (like Vercel),
  // this action might fail if the env var is not set.
  console.warn(
    'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
    'Firebase Admin SDK initialization may fail if not in a GCP environment with Application Default Credentials.'
  );
}

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
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
    // If parsing fails or initialization fails, log the error.
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    // In a production app, you might want to throw the error or handle it differently.
    // For now, we will allow the app to continue running, but admin features will fail.
  }
}

const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
const db = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore);

export { auth, db };
