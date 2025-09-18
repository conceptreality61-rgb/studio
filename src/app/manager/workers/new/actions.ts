
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function createWorker(data: { 
  name: string; 
  email: string; 
  services: string[];
  fatherName: string;
  mobile: string;
  idDetails: string;
  address: string;
}) {
  try {
    const docRef = await addDoc(collection(db, 'workers'), {
      displayName: data.name,
      email: data.email,
      services: data.services,
      fatherName: data.fatherName,
      mobile: data.mobile,
      idDetails: data.idDetails,
      address: data.address,
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
