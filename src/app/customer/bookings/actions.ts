
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export async function acceptEstimate(bookingId: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'Pending Worker Assignment',
      statusHistory: arrayUnion({ status: 'Pending Worker Assignment', timestamp: new Date() }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to accept the estimate.' };
  }
}

export async function rejectEstimate(bookingId: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'Canceled',
      statusHistory: arrayUnion({ status: 'Canceled', timestamp: new Date() }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to reject the estimate.' };
  }
}
