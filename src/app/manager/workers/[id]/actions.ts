
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function updateWorkerStatus(workerId: string, status: 'Active' | 'Inactive') {
  try {
    const workerRef = doc(db, 'workers', workerId);
    await updateDoc(workerRef, {
      status: status
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating worker status:', error);
    return { success: false, error: 'Failed to update worker status.' };
  }
}
