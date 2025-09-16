
'use server';

import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

// The form values are validated on the client-side using a Zod schema in the page.tsx file.
// This server action receives the validated data.
export async function createWorker(values: {
  displayName: string;
  fatherName: string;
  mobile: string;
  aadharNumber: string;
  workerGroup: string;
  services: string[];
}) {
  try {
    // The 'values' object is already validated by the form on the client.
    // We can proceed to save it directly.
    await db.collection('users').add({
      ...values,
      role: 'worker',
      verificationStatus: 'Approved', 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error creating worker:', error);
    return { success: false, error: 'An unexpected error occurred on the server.' };
  }
}
