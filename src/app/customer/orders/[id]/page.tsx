
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import OrderTracker from "@/components/order-tracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Booking = {
  serviceName: string;
  date: Timestamp;
  time: string;
  workerName?: string;
  status: string;
  estimatedCharge?: number;
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
                    <div className="flex justify-between"><span>Service:</span> <span className="font-medium">{booking.serviceName}</span></div>
                    <div className="flex justify-between"><span>Date:</span> <span className="font-medium">{formatDate(booking.date)}</span></div>
                    <div className="flex justify-between"><span>Time:</span> <span className="font-medium">{booking.time}</span></div>
                    <div className="flex justify-between"><span>Worker:</span> <span className="font-medium">{booking.workerName || 'Not assigned yet'}</span></div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base"><strong>Total:</strong> <strong className="text-primary">{booking.estimatedCharge ? `Rs. ${booking.estimatedCharge}` : `Pending Estimate`}</strong></div>
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
