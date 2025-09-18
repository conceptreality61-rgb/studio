
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createWorker(data: { 
  name: string; 
  email: string; 
  services: string[];
  fatherName: string;
  mobile: string;
  idDetails: { type: string, number: string };
  idDetails2?: { type: string, number: string };
  address: string;
  knowsDriving: boolean;
  hasVehicle: boolean;
}) {
  try {
    const docRef = await addDoc(collection(db, 'workers'), {
      displayName: data.name,
      email: data.email,
      services: data.services,
      fatherName: data.fatherName,
      mobile: data.mobile,
      idDetails: data.idDetails,
      idDetails2: data.idDetails2,
      address: data.address,
      knowsDriving: data.knowsDriving,
      hasVehicle: data.hasVehicle,
      createdAt: serverTimestamp(),
    });

    return { success: true, uid: docRef.id };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred while creating the worker.';
    if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error creating worker:', error);
    return { success: false, error: errorMessage };
  }
}
