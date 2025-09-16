
'use server';

import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { z } from 'zod';

// This schema is now only for type inference and is a simplified representation.
// The primary validation is handled on the client in page.tsx.
const createWorkerSchema = z.object({
  displayName: z.string(),
  fatherName: z.string(),
  mobile: z.string(),
  aadharNumber: z.string(),
  workerGroup: z.string(),
  services: z.array(z.string()),
});

export async function createWorker(values: z.infer<typeof createWorkerSchema>) {
  try {
    // We still validate to ensure the data is correct before it goes to the database.
    const validatedValues = createWorkerSchema.parse(values);

    await db.collection('users').add({
      ...validatedValues,
      role: 'worker',
      verificationStatus: 'Approved', // Manually created workers are pre-approved
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Failed to create worker.';
    if (error instanceof z.ZodError) {
        // If validation fails, construct a clear error message.
        errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' ');
    } else {
        console.error('Error creating worker:', error);
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
}
