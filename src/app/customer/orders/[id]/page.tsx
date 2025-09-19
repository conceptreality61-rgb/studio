
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderTracker from "@/components/order-tracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { services } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Loader2, Check, XCircle, Phone, User } from 'lucide-react';
import { acceptEstimate, rejectEstimate } from '@/app/customer/bookings/actions';
import { useToast } from '@/hooks/use-toast';

type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  date: Timestamp;
  time: string;
  workerId?: string;
  workerName?: string;
  status: string;
  estimatedCharge?: number;
  options: Record<string, string | string[]>;
};

type Worker = {
    mobile?: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const bookingId = params.id as string;

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const docRef = doc(db, 'bookings', bookingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const bookingData = { id: docSnap.id, ...docSnap.data() } as Booking;
          setBooking(bookingData);
          
          if (bookingData.workerId) {
              const workerRef = doc(db, 'workers', bookingData.workerId);
              const workerSnap = await getDoc(workerRef);
              if (workerSnap.exists()) {
                  setWorker(workerSnap.data() as Worker);
              }
          }

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
  }, [bookingId]);

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

  const handleEstimateAction = async (action: 'accept' | 'reject') => {
    if (!booking) return;

    setIsActionLoading(true);
    try {
        let result;
        if (action === 'accept') {
            result = await acceptEstimate(booking.id);
            if (result.success) {
                toast({ title: "Estimate Accepted", description: "The manager has been notified to proceed." });
                setBooking(prev => prev ? { ...prev, status: 'Pending Worker Assignment' } : null);
            } else {
                throw new Error(result.error);
            }
        } else { // reject
            result = await rejectEstimate(booking.id);
            if (result.success) {
                toast({ title: "Estimate Rejected", description: "This booking has been canceled." });
                setBooking(prev => prev ? { ...prev, status: 'Canceled' } : null);
            } else {
                throw new Error(result.error);
            }
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
    } finally {
        setIsActionLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>Tracking information for booking #{bookingId.substring(0,6)}.</CardDescription>
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
                    
                    {['In Progress', 'Completed'].includes(booking.status) && booking.workerName && (
                        <>
                            <Separator />
                            <div className='py-2'>
                                <p className='font-medium mb-2'>Worker Details</p>
                                <div className="flex justify-between items-center">
                                    <span className='flex items-center gap-2'><User className='w-4 h-4 text-muted-foreground' /> Worker Name:</span> 
                                    <span className="font-medium">{booking.workerName}</span>
                                </div>
                                {worker?.mobile && (
                                    <div className="flex justify-between items-center">
                                        <span className='flex items-center gap-2'><Phone className='w-4 h-4 text-muted-foreground' /> Mobile:</span> 
                                        <span className="font-medium">{worker.mobile}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

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
      {booking?.status === 'Pending Customer Approval' && (
        <CardFooter className="border-t pt-4 flex justify-end gap-2">
            <Button variant="destructive" onClick={() => handleEstimateAction('reject')} disabled={isActionLoading}>
                {isActionLoading ? <Loader2 className="animate-spin" /> : <XCircle />}
                Reject Estimate
            </Button>
            <Button onClick={() => handleEstimateAction('accept')} disabled={isActionLoading}>
                {isActionLoading ? <Loader2 className="animate-spin" /> : <Check />}
                Accept Estimate
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
