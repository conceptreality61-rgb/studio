
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function updateWorker(id: string, data: { 
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
    const workerRef = doc(db, 'workers', id);
    await updateDoc(workerRef, {
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
      drivingLicenseNumber: data.drivingLicenseNumber,
      vehicleNumber: data.vehicleNumber,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred while updating the worker.';
    if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error updating worker:', error);
    return { success: false, error: errorMessage };
  }
}
