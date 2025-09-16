
'use server';

import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { z } from 'zod';

const createWorkerSchema = z.object({
  displayName: z.string().min(2, "Name is required."),
  fatherName: z.string().min(2, "Father's name is required."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be a 10-digit number."),
  idNumber: z.string().min(5, "ID number is required."),
  services: z.array(z.string()).optional(),
  // The file fields are not validated here as they are handled separately
  // in a real app (e.g., uploaded to a storage service).
});

export async function createWorker(values: z.infer<typeof createWorkerSchema>) {
  try {
    const validatedValues = createWorkerSchema.parse(values);

    // Use the admin SDK's methods to add a document
    await db.collection('users').add({
      ...validatedValues,
      role: 'worker',
      verificationStatus: 'Approved',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Failed to create worker.';
    if (error instanceof z.ZodError) {
        errorMessage = error.errors.map(e => e.message).join(' ');
    }
    
    console.error('Error creating worker:', error);
    return { success: false, error: errorMessage };
  }
}
