
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  status: string;
  estimatedCharge?: number;
  createdAt: Timestamp;
};

type Review = {
    id: string;
    bookingId: string;
    userId: string;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning" | "magenta" } = {
  "Pending Manager Approval": "destructive",
  "Pending Customer Approval": "warning",
  "Pending Worker Assignment": "magenta",
  "Worker Assigned": "info",
  "In Progress": "secondary",
  Completed: "success",
  Canceled: "destructive",
};

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Fetch recent bookings
        const recentBookingsQuery = query(
            collection(db, 'bookings'), 
            where('userId', '==', user.uid),
            // orderBy('createdAt', 'desc'), // This requires a composite index
            limit(10) // Fetch more and sort/limit client side
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const bookings = recentBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        
        // Sort client-side
        bookings.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setRecentBookings(bookings.slice(0, 3));


        // Fetch completed bookings for review check
        const completedBookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          where('status', '==', 'Completed')
        );
        const completedBookingsSnapshot = await getDocs(completedBookingsQuery);
        const completedBookings = completedBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

        // Fetch existing reviews
        const reviewsQuery = query(
            collection(db, 'reviews'),
            where('userId', '==', user.uid)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewedBookingIds = new Set(reviewsSnapshot.docs.map(doc => doc.data().bookingId));

        // Filter out bookings that have already been reviewed
        const bookingsToReview = completedBookings.filter(booking => !reviewedBookingIds.has(booking.id));
        setPendingReviews(bookingsToReview);

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.displayName ?? 'Customer'}!</CardTitle>
          <CardDescription>Here's an overview of your recent activity.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
          ) : (
            <>
              {pendingReviews.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Pending Reviews</h3>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Completed On</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingReviews.map(booking => (
                                    <TableRow key={booking.id} className="border-amber-200">
                                        <TableCell className="font-medium">{booking.serviceName}</TableCell>
                                        <TableCell>{formatDate(booking.date)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/customer/review/${booking.id}`}>
                                                    <Star className="mr-2 h-4 w-4" />
                                                    Leave a Review
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                  </Card>
                </div>
              )}

              <h3 className="font-semibold mb-4">Recent Bookings</h3>
              {recentBookings.length > 0 ? (
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
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.serviceName}</TableCell>
                        <TableCell>{formatDate(booking.date)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{booking.estimatedCharge ? `Rs. ${booking.estimatedCharge}` : `Pending`}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/customer/orders/${booking.id}`}><ArrowRight className="h-4 w-4" /></Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No recent bookings to display.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
         <CardFooter className="border-t pt-6">
            <Button asChild>
              <Link href="/#services">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Book New Service
              </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
