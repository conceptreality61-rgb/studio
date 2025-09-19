
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle } from "lucide-react";
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
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "In Progress": "secondary",
  "Pending Manager Approval": "outline",
  Canceled: "destructive"
};

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
            collection(db, 'bookings'), 
            where('userId', '==', user.uid),
            limit(3)
        );
        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setRecentBookings(bookings.sort((a, b) => (b as any).createdAt.toMillis() - (a as any).createdAt.toMillis()));
      } catch (error) {
        console.error("Error fetching recent bookings: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, [user]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {user?.displayName ?? 'Customer'}!</CardTitle>
        <CardDescription>Here's an overview of your recent activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-4">Recent Bookings</h3>
        {loading ? (
           <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
        ) : recentBookings.length > 0 ? (
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
  );
}
