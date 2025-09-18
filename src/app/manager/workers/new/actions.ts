
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function createWorker(data: { 
  workerId: string;
  name: string; 
  email: string; 
  services: string[];
  fatherName: string;
  mobile: string;
  idDetails?: { type?: string; number?: string; url?: string };
  idDetails2?: { type?: string; number?: string; url?: string };
  address: string;
  knowsDriving: boolean;
  hasVehicle: boolean;
  drivingLicenseNumber?: string;
  vehicleNumber?: string;
  photoURL?: string;
}) {
  try {
    const { workerId, ...workerData } = data;
    const workerRef = doc(db, 'workers', workerId);

    const docSnap = await getDoc(workerRef);
    if (docSnap.exists()) {
        return { success: false, error: `A worker with ID "${workerId}" already exists.`};
    }
    
    const idDetails = (workerData.idDetails?.type && workerData.idDetails?.number) ? {
        type: workerData.idDetails.type,
        number: workerData.idDetails.number,
        url: workerData.idDetails.url || null
    } : null;

    const idDetails2 = (workerData.idDetails2?.type && workerData.idDetails2?.number) ? {
        type: workerData.idDetails2.type,
        number: workerData.idDetails2.number,
        url: workerData.idDetails2.url || null
    } : null;


    await setDoc(workerRef, {
      displayName: workerData.name,
      email: workerData.email,
      services: workerData.services,
      fatherName: workerData.fatherName,
      mobile: workerData.mobile,
      idDetails: idDetails,
      idDetails2: idDetails2,
      address: workerData.address,
      knowsDriving: workerData.knowsDriving,
      hasVehicle: workerData.hasVehicle,
      drivingLicenseNumber: workerData.drivingLicenseNumber || null,
      vehicleNumber: workerData.vehicleNumber || null,
      photoURL: workerData.photoURL || null,
      status: 'Active', // Default status for new workers
      createdAt: serverTimestamp(),
    });

    return { success: true, uid: workerId };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred while creating the worker.';
    if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error creating worker:', error);
    return { success: false, error: errorMessage };
  }
}
