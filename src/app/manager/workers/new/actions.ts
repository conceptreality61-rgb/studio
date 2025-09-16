
'use server';

import { db } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { z } from 'zod';

// This schema defines the shape of the data we expect to receive.
const createWorkerSchema = z.object({
  displayName: z.string().min(2, "Name is required."),
  fatherName: z.string().min(2, "Father's name is required."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be a 10-digit number."),
  aadharNumber: z.string().regex(/^\d{12}$/, "Aadhar must be a 12-digit number."),
  workerGroup: z.string().min(1, "Worker group is required."),
  services: z.array(z.string()).min(1, "At least one service must be selected."),
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
