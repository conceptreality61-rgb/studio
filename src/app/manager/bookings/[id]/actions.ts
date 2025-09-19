
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export async function submitEstimate(bookingId: string, estimatedCharge: number) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      estimatedCharge: estimatedCharge,
      status: 'Pending Customer Approval',
      statusHistory: arrayUnion({ status: 'Pending Customer Approval', timestamp: serverTimestamp() }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to submit estimate.' };
  }
}

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
      status: 'Worker Assigned',
      statusHistory: arrayUnion({ status: 'Worker Assigned', timestamp: serverTimestamp() })
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

export async function completeJob(bookingId: string, finalCharge: number) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'Completed',
      estimatedCharge: finalCharge,
      statusHistory: arrayUnion({ status: 'Completed', timestamp: serverTimestamp() }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to complete job.' };
  }
}
