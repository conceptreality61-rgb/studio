
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function updateWorker(id: string, data: { 
  name: string; 
  email: string; 
  services: string[];
  fatherName: string;
  mobile: string;
  idDetails: { type?: string; number?: string; url?: string };
  idDetails2?: { type?: string; number?: string; url?: string };
  address: string;
  knowsDriving: boolean;
  hasVehicle: boolean;
  drivingLicenseNumber?: string;
  vehicleNumber?: string;
  photoURL?: string;
}) {
  try {
    const workerRef = doc(db, 'workers', id);
    
    const updateData: any = {
      displayName: data.name,
      email: data.email,
      services: data.services,
      fatherName: data.fatherName,
      mobile: data.mobile,
      address: data.address,
      knowsDriving: data.knowsDriving,
      hasVehicle: data.hasVehicle,
      drivingLicenseNumber: data.drivingLicenseNumber || null,
      vehicleNumber: data.vehicleNumber || null,
      updatedAt: serverTimestamp(),
    };
    
    if (data.photoURL) {
      updateData.photoURL = data.photoURL;
    }

    if (data.idDetails && data.idDetails.type && data.idDetails.number) {
        updateData.idDetails = {
            type: data.idDetails.type,
            number: data.idDetails.number,
            url: data.idDetails.url || null
        };
    } else {
        updateData.idDetails = null;
    }

    if (data.idDetails2 && data.idDetails2.type && data.idDetails2.number) {
        updateData.idDetails2 = {
            type: data.idDetails2.type,
            number: data.idDetails2.number,
            url: data.idDetails2.url || null
        };
    } else {
        updateData.idDetails2 = null; 
    }
    
    await updateDoc(workerRef, updateData);

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
