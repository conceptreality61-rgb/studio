
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import OrderTracker from "@/components/order-tracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { services } from '@/lib/constants';

type Booking = {
  serviceId: string;
  serviceName: string;
  date: Timestamp;
  time: string;
  workerName?: string;
  status: string;
  estimatedCharge?: number;
  options: Record<string, string | string[]>;
};

export default function OrderDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, 'bookings', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBooking(docSnap.data() as Booking);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.id]);

  const serviceDetails = useMemo(() => {
    if (!booking) return null;
    return services.find(s => s.id === booking.serviceId);
  }, [booking]);

  const customerSelections = useMemo(() => {
    if (!booking || !serviceDetails) return [];
    
    const selections: string[] = [];

    serviceDetails.subCategories?.forEach(subCat => {
        const selection = booking.options[subCat.id];
        if (selection) {
            const selectedIds = Array.isArray(selection) ? selection : [selection];

            selectedIds.forEach(id => {
                const option = subCat.options.find(opt => opt.id === id);
                if(option) {
                    selections.push(option.name);
                }
            });
        }
    });
    return selections;
  }, [booking, serviceDetails]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Tracking information for booking #{params.id}.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
            <h3 className="font-semibold mb-4">Order Summary</h3>
            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                    <Separator className="my-2" />
                    <Skeleton className="h-6 w-1/3" />
                </div>
            ) : booking ? (
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Service:</span> 
                        <div className="text-right">
                          <span className="font-medium">{booking.serviceName}</span>
                          {customerSelections.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {customerSelections.join(' • ')}
                            </div>
                          )}
                        </div>
                    </div>
                    <div className="flex justify-between"><span>Date:</span> <span className="font-medium">{formatDate(booking.date)}</span></div>
                    <div className="flex justify-between"><span>Time:</span> <span className="font-medium">{booking.time}</span></div>
                    <div className="flex justify-between"><span>Worker:</span> <span className="font-medium">{booking.workerName || 'Not assigned yet'}</span></div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base"><strong>Total Estimated Value:</strong> <strong className="text-primary">{booking.estimatedCharge ? `Rs. ${booking.estimatedCharge}` : `Pending Estimate`}</strong></div>
                    <div className="mt-4 text-xs text-muted-foreground space-y-1 border-t pt-2">
                        <p><b>Terms & Conditions:</b></p>
                        <ul className="list-disc list-inside">
                            <li>Service will be provided as per the service description and estimated value.</li>
                            <li>Estimated value may change as per actual condition.</li>
                            <li>All cleaning material will be provided by the service provider.</li>
                            <li>Discuss for final value as per actual requirement before work starts.</li>
                            <li>No extra tips to be paid to the worker.</li>
                            <li>Please try to make payments in online mode.</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <p>Booking details not found.</p>
            )}
        </div>
        <div>
          <h3 className="font-semibold mb-4">Live Status</h3>
          <OrderTracker status={booking?.status} />
        </div>
      </CardContent>
    </Card>
  );
}
