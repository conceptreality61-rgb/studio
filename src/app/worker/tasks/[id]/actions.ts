
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export async function acceptJob(bookingId: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'In Progress',
      statusHistory: arrayUnion({ status: 'In Progress', timestamp: serverTimestamp() }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to accept job.' };
  }
}

export async function refuseJob(bookingId: string, workerId: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { 
        status: 'Pending Manager Approval',
        workerId: null,
        workerName: null,
        refusedBy: arrayUnion(workerId),
        statusHistory: arrayUnion({ status: 'Pending Manager Approval', timestamp: serverTimestamp(), reason: `Refused by ${workerId}` }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to refuse job.' };
  }
}
