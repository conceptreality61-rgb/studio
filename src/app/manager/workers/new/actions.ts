
'use server';

import { db } from '@/lib/firebase-admin';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const createWorkerSchema = z.object({
  displayName: z.string().min(2, "Name is required."),
  fatherName: z.string().min(2, "Father's name is required."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be a 10-digit number."),
  idNumber: z.string().min(5, "ID number is required."),
  services: z.string().optional(),
});

export async function createWorker(values: z.infer<typeof createWorkerSchema>) {
  try {
    const validatedValues = createWorkerSchema.parse(values);

    // This action now just adds a document to Firestore, no Auth.
    await addDoc(collection(db, 'users'), {
      ...validatedValues,
      role: 'worker',
      verificationStatus: 'Approved', // Workers created by managers are pre-approved
      createdAt: serverTimestamp(),
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

    