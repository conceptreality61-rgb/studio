
'use server';

import { auth, db } from '@/lib/firebase-admin';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const createWorkerSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createWorker(values: z.infer<typeof createWorkerSchema>) {
  try {
    const validatedValues = createWorkerSchema.parse(values);

    // This action now requires Firebase Admin SDK to create users.
    // The regular client SDK cannot create users from a server action like this.
    const userRecord = await auth.createUser({
      email: validatedValues.email,
      password: validatedValues.password,
      displayName: validatedValues.displayName,
    });

    await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: validatedValues.email,
        displayName: validatedValues.displayName,
        role: 'worker',
        verificationStatus: 'Approved', // Workers created by managers are pre-approved
        createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Failed to create worker.';
    if (error.code === 'auth/email-already-exists') {
        errorMessage = 'A user with this email address already exists.';
    } else if (error instanceof z.ZodError) {
        errorMessage = error.errors.map(e => e.message).join(' ');
    }
    
    console.error('Error creating worker:', error);
    return { success: false, error: errorMessage };
  }
}
