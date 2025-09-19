
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createBooking(bookingData: {
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  options: Record<string, string | string[]>;
  userId: string;
  customerName: string;
  status: string;
}) {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: serverTimestamp(),
    });
    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error('Error creating booking: ', error);
    return { success: false, error: 'Failed to create booking.' };
  }
}
