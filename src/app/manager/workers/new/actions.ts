
'use server';

import { auth, db } from '@/lib/firebase-admin';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

export async function createWorker(data: { name: string; email: string; services: string[] }) {
  try {
    const password = Math.random().toString(36).slice(-8);
    const userRecord = await auth.createUser({
      email: data.email,
      emailVerified: false,
      password: password,
      displayName: data.name,
      disabled: false,
    });

    await setDoc(doc(db, 'users', userRecord.uid), {
      uid: userRecord.uid,
      displayName: data.name,
      email: data.email,
      services: data.services,
      role: 'worker',
      verificationStatus: 'Pending',
      createdAt: serverTimestamp(),
    });

    await auth.generatePasswordResetLink(data.email);
    
    // In a real app, you would use a proper email service to send the welcome email
    // with the temporary password and a prompt to reset it.
    console.log(`
      Worker created: ${data.name} (${data.email})
      Temporary Password: ${password}
      A password reset link has been generated. In a real app, you would email this link to the user.
    `);

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'A user with this email address already exists.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error creating worker:', error);
    return { success: false, error: errorMessage };
  }
}
