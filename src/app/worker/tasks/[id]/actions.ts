
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';

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

    const docSnap = await getDoc(bookingRef);
    if (!docSnap.exists()) {
      throw new Error("Booking not found");
    }
    const existingData = docSnap.data();

    const newRefusedBy = [...(existingData.refusedBy || []), workerId];
    const newStatusHistory = [
      ...(existingData.statusHistory || []),
      { status: 'Pending Manager Approval', timestamp: serverTimestamp(), reason: `Refused by ${workerId}` }
    ];

    await updateDoc(bookingRef, {
      status: 'Pending Manager Approval',
      workerId: null,
      workerName: null,
      refusedBy: newRefusedBy,
      statusHistory: newStatusHistory,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error refusing job:', error);
    return { success: false, error: 'Failed to refuse job.' };
  }
}
