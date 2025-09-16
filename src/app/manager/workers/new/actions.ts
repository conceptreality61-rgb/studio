
'use server';

import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export async function createWorker(values: {
  displayName: string;
  fatherName: string;
  mobile: string;
  aadharNumber: string;
  workerGroup: string;
  services: string[];
}) {
  try {
    await db.collection('users').add({
      ...values,
      role: 'worker',
      verificationStatus: 'Approved', 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error creating worker:', error);
    // Return a more specific error message if possible
    return { success: false, error: error.message || 'An unexpected error occurred on the server.' };
  }
}
