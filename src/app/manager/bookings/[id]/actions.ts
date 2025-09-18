
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function assignWorkerToBooking(bookingId: string, workerId: string, workerName: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      workerId: workerId,
      workerName: workerName,
      status: 'Worker Assigned'
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error assigning worker:', error);
    return { success: false, error: 'Failed to assign worker. Please try again.' };
  }
}
