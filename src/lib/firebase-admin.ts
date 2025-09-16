
import * as admin from 'firebase-admin';

// This is a server-only file. It should not be imported on the client.

let serviceAccount: admin.ServiceAccount | undefined;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON object.');
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // This will only work in Google Cloud environments (like Cloud Functions, App Engine, etc.)
    // where default credentials are automatically available.
    // For local development, you MUST set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY not found. Initializing Firebase Admin SDK with default credentials. ' +
      'This will only work in a hosted Google Cloud environment. ' +
      'For local development, set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
    );
    // In a non-Google Cloud environment, initializeApp() without credentials will fail.
    // We can check for a specific environment variable that indicates a GCP environment.
    if (process.env.GCP_PROJECT) {
      admin.initializeApp();
    } else {
        console.log('Skipping Firebase Admin SDK initialization due to missing credentials in a non-GCP environment.');
    }
  }
}

const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth);
const db = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore);

export { auth, db };
