
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, XCircle, PlusCircle, Loader2 } from "lucide-react";
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
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  status: string;
  servicePrice: number;
  time: string;
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      };
      
      try {
        const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(userBookings.sort((a, b) => b.date.toMillis() - a.date.toMillis()));
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


  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsAlertOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (bookingToCancel) {
        try {
            const bookingRef = doc(db, 'bookings', bookingToCancel);
            await updateDoc(bookingRef, { status: 'Canceled' });

            setBookings(currentBookings =>
                currentBookings.map(b =>
                b.id === bookingToCancel ? { ...b, status: 'Canceled' } : b
                )
            );
            toast({
                title: "Booking Canceled",
                description: `Your booking #${bookingToCancel.substring(0, 6)}... has been successfully canceled.`,
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
    return date.toLocaleString();
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>View your booking history and leave reviews for completed services.</CardDescription>
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
                  <TableHead></TableHead>
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
                    <TableCell className="text-right">Rs.{booking.servicePrice}/hr</TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'Completed' ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/customer/review/${booking.id}`}>
                            <Star className="mr-2 h-4 w-4" />
                            Leave a Review
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
    </>
  );
}
