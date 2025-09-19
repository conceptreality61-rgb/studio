
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, XCircle, PlusCircle, Loader2, Check, AlertTriangle, CircleHelp, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, orderBy, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { acceptEstimate, rejectEstimate } from './actions';

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  status: string;
  time: string;
  estimatedCharge?: number;
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "info" | "warning" | "success" | "magenta" } = {
  "Pending Manager Approval": "destructive",
  "Pending Customer Approval": "warning",
  "Pending Worker Assignment": "magenta",
  "Worker Assigned": "info",
  "In Progress": "secondary",
  Completed: "success",
  Canceled: "destructive",
};


export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isEstimateActionLoading, setIsEstimateActionLoading] = useState<string | null>(null);
  const [estimateAction, setEstimateAction] = useState<'accept' | 'reject' | null>(null);
  const [estimateAlertOpen, setEstimateAlertOpen] = useState(false);
  const [selectedBookingForEstimate, setSelectedBookingForEstimate] = useState<Booking | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      };
      
      try {
        const q = query(
          collection(db, 'bookings'), 
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(userBookings.sort((a, b) => (b as any).createdAt.toMillis() - (a as any).createdAt.toMillis()));
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your bookings.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, toast]);

  const handleEstimateActionClick = (booking: Booking, action: 'accept' | 'reject') => {
    setSelectedBookingForEstimate(booking);
    setEstimateAction(action);
    setEstimateAlertOpen(true);
  }

  const handleConfirmEstimateAction = async () => {
    if (!selectedBookingForEstimate || !estimateAction) return;

    setIsEstimateActionLoading(selectedBookingForEstimate.id);
    try {
      let result;
      if (estimateAction === 'accept') {
        result = await acceptEstimate(selectedBookingForEstimate.id);
        if (result.success) {
          toast({ title: "Estimate Accepted", description: "The manager has been notified to proceed." });
          setBookings(current => current.map(b => b.id === selectedBookingForEstimate.id ? { ...b, status: 'Pending Worker Assignment' } : b));
        } else {
          throw new Error(result.error);
        }
      } else { // reject
        result = await rejectEstimate(selectedBookingForEstimate.id);
        if (result.success) {
          toast({ title: "Estimate Rejected", description: "This booking has been canceled." });
          setBookings(current => current.map(b => b.id === selectedBookingForEstimate.id ? { ...b, status: 'Canceled' } : b));
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
    } finally {
      setIsEstimateActionLoading(null);
      setEstimateAlertOpen(false);
      setSelectedBookingForEstimate(null);
      setEstimateAction(null);
    }
  };


  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsAlertOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (bookingToCancel) {
        try {
            const bookingRef = doc(db, 'bookings', bookingToCancel);
            await updateDoc(bookingRef, {
                status: 'Canceled',
                statusHistory: arrayUnion({ status: 'Canceled', timestamp: serverTimestamp() }),
            });

            setBookings(currentBookings =>
                currentBookings.map(b =>
                b.id === bookingToCancel ? { ...b, status: 'Canceled' } : b
                )
            );
            toast({
                title: "Booking Canceled",
                description: `Your booking has been successfully canceled.`,
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "Error",
                description: `Failed to cancel booking.`,
            });
        }
    }
    setIsAlertOpen(false);
    setBookingToCancel(null);
  };
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>View your booking history and manage upcoming services.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.serviceName}</TableCell>
                    <TableCell>{formatDate(booking.date)} at {booking.time}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{booking.estimatedCharge ? `Rs. ${booking.estimatedCharge}` : `Pending`}</TableCell>
                    <TableCell className="text-right">
                       {booking.status === 'Pending Customer Approval' ? (
                          <Button variant="outline" size="sm" asChild>
                              <Link href={`/customer/orders/${booking.id}`}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                View & Respond
                              </Link>
                          </Button>
                      ) : booking.status === 'Completed' ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/customer/review/${booking.id}`}>
                            <Star className="mr-2 h-4 w-4" />
                            Leave Review
                          </Link>
                        </Button>
                      ) : !['Completed', 'Canceled'].includes(booking.status) ? (
                        <Button variant="destructive" size="sm" onClick={() => handleCancelClick(booking.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/customer/orders/${booking.id}`}><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-12">
                <p className='text-lg mb-2'>You have no bookings yet.</p>
                <p className='mb-4'>Book a service to see it here.</p>
                <Button asChild>
                    <Link href="/#services">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Book New Service
                    </Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your service booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookingToCancel(null)}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Confirm Cancellation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={estimateAlertOpen} onOpenChange={setEstimateAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                {estimateAction === 'accept' ? <Check className="text-green-500"/> : <AlertTriangle className="text-destructive"/>}
                Confirm Your Decision
            </AlertDialogTitle>
            <AlertDialogDescription>
              {estimateAction === 'accept' 
                ? `You are about to accept the estimated charge of Rs. ${selectedBookingForEstimate?.estimatedCharge}. The manager will be notified to proceed with assigning a worker.`
                : `You are about to reject the estimated charge. This will cancel the booking. Are you sure?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEstimateAction}>
              {estimateAction === 'accept' ? 'Yes, Accept Estimate' : 'Yes, Reject and Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
