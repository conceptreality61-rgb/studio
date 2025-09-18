
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
    
    // Construct the data object to prevent sending undefined values for nested objects
    const updateData: any = {
      displayName: data.name,
      email: data.email,
      services: data.services,
      fatherName: data.fatherName,
      mobile: data.mobile,
      address: data.address,
      knowsDriving: data.knowsDriving,
      hasVehicle: data.hasVehicle,
      drivingLicenseNumber: data.drivingLicenseNumber || '',
      vehicleNumber: data.vehicleNumber || '',
      updatedAt: serverTimestamp(),
    };

    if (data.idDetails && data.idDetails.type && data.idDetails.number) {
        updateData.idDetails = data.idDetails;
    }

    if (data.idDetails2 && data.idDetails2.type && data.idDetails2.number) {
        updateData.idDetails2 = data.idDetails2;
    } else {
        updateData.idDetails2 = {}; // Or use FieldValue.delete() if you want to remove it
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
