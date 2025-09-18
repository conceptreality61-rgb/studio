
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function assignWorkerToBooking(
  bookingId: string, 
  workerId: string, 
  workerName: string,
  previousWorkerId?: string
) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    
    const updateData: { [key: string]: any } = {
      workerId: workerId,
      workerName: workerName,
      status: 'Worker Assigned'
    };

    if (previousWorkerId) {
      updateData.canceledWorkerIds = arrayUnion(previousWorkerId);
    }

    await updateDoc(bookingRef, updateData);

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning worker:', error);
    return { success: false, error: 'Failed to assign worker. Please try again.' };
  }
}
