
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';

export async function submitEstimate(bookingId: string, estimatedCharge: number) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      estimatedCharge: estimatedCharge,
      initialEstimate: estimatedCharge, // Also store the initial estimate
      status: 'Pending Customer Approval',
      statusHistory: arrayUnion({ status: 'Pending Customer Approval', timestamp: new Date(), estimate: estimatedCharge }),
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
    
    const docSnap = await getDoc(bookingRef);
    if (!docSnap.exists()) {
      throw new Error("Booking not found");
    }
    const existingData = docSnap.data();

    const newStatusHistory = [
      ...(existingData.statusHistory || []), 
      { status: 'Worker Assigned', timestamp: new Date() }
    ];

    const newCanceledWorkerIds = [...(existingData.canceledWorkerIds || [])];
    if (previousWorkerId) {
      newCanceledWorkerIds.push(previousWorkerId);
    }
    
    const updateData: { [key: string]: any } = {
      workerId: workerId,
      workerName: workerName,
      status: 'Worker Assigned',
      statusHistory: newStatusHistory,
      canceledWorkerIds: newCanceledWorkerIds,
    };

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
      statusHistory: arrayUnion({ status: 'In Progress', timestamp: new Date() }),
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
      { status: 'Pending Manager Approval', timestamp: new Date(), reason: `Refused by ${workerId}` }
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

export async function completeJob(bookingId: string, finalCharge: number) {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'Completed',
      estimatedCharge: finalCharge,
      statusHistory: arrayUnion({ status: 'Completed', timestamp: new Date() }),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error completing job:', error);
    return { success: false, error: error.message };
  }
}
    