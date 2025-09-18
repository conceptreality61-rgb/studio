
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
  idDetails: { type: string, number: string };
  idDetails2?: { type: string, number: string };
  address: string;
  knowsDriving: boolean;
  hasVehicle: boolean;
  drivingLicenseNumber?: string;
  vehicleNumber?: string;
}) {
  try {
    const { workerId, ...workerData } = data;
    const workerRef = doc(db, 'workers', workerId);

    const docSnap = await getDoc(workerRef);
    if (docSnap.exists()) {
        return { success: false, error: `A worker with ID "${workerId}" already exists.`};
    }

    await setDoc(workerRef, {
      displayName: workerData.name,
      email: workerData.email,
      services: workerData.services,
      fatherName: workerData.fatherName,
      mobile: workerData.mobile,
      idDetails: workerData.idDetails,
      idDetails2: workerData.idDetails2,
      address: workerData.address,
      knowsDriving: workerData.knowsDriving,
      hasVehicle: workerData.hasVehicle,
      drivingLicenseNumber: workerData.drivingLicenseNumber,
      vehicleNumber: workerData.vehicleNumber,
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
