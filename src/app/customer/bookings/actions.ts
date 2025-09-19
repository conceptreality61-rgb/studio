
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function acceptEstimate(bookingId: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status: 'Pending Manager Approval' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to accept the estimate.' };
  }
}

export async function rejectEstimate(bookingId: string) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status: 'Canceled' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to reject the estimate.' };
  }
}
