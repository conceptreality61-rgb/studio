
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, XCircle } from "lucide-react";
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


const initialBookings = [
    { id: 'BK001', service: 'Maid Service', date: '2023-06-23T10:00:00Z', status: 'Completed', amount: '$50.00' },
    { id: 'BK002', service: 'Gardening', date: '2024-08-15T18:00:00Z', status: 'Worker Assigned', amount: '$90.00' },
    { id: 'BK003', service: 'Tank Cleaning', date: '2023-05-12T14:00:00Z', status: 'Completed', amount: '$70.00' },
    { id: 'BK004', service: 'Bathroom Cleaning', date: '2023-04-18T09:00:00Z', status: 'Completed', amount: '$35.00' },
    { id: 'BK005', service: 'Maid Service', date: '2024-09-01T10:00:00Z', status: 'Pending Manager Approval', amount: '$50.00' },
    { id: 'BK006', service: 'Gardening', date: '2023-06-29T16:00:00Z', status: 'Canceled', amount: '$45.00' },
    { id: 'BK007', service: 'Maid Service', date: '2024-08-20T12:00:00Z', status: 'Worker Assigned', amount: '$75.00' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsAlertOpen(true);
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      setBookings(currentBookings =>
        currentBookings.map(b =>
          b.id === bookingToCancel ? { ...b, status: 'Canceled' } : b
        )
      );
      toast({
        title: "Booking Canceled",
        description: `Your booking #${bookingToCancel} has been successfully canceled.`,
      });
    }
    setIsAlertOpen(false);
    setBookingToCancel(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>View your booking history and leave reviews for completed services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.service}</TableCell>
                  <TableCell>{isClient ? new Date(booking.date).toLocaleString() : ''}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{booking.amount}</TableCell>
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
