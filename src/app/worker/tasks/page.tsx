
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  status: 'Worker Assigned' | 'In Progress' | 'Completed' | 'Canceled';
  time: string;
};

const statusConfig: { [key in Booking['status']]: { variant: "default" | "secondary" | "destructive" | "outline" | "info" | "success", icon: React.ElementType } } = {
  "Worker Assigned": { variant: "info", icon: Clock },
  "In Progress": { variant: "secondary", icon: Loader2 },
  Completed: { variant: "success", icon: CheckCircle },
  Canceled: { variant: "destructive", icon: XCircle }
};

export default function WorkerTasksPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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
          where('workerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const workerBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        
        const statusOrder = {
            'Worker Assigned': 1,
            'In Progress': 2,
            'Completed': 3,
            'Canceled': 4,
        };

        workerBookings.sort((a,b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));

        setBookings(workerBookings);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch your tasks.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, toast]);

  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>View all your assigned, active, and completed jobs.</CardDescription>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const config = statusConfig[booking.status] || { variant: "default", icon: CheckCircle};
                  return (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.serviceName}</TableCell>
                        <TableCell>{formatDate(booking.date)} at {booking.time}</TableCell>
                        <TableCell>
                            <Badge variant={config.variant} className="gap-1">
                                <config.icon className={`h-3 w-3 ${booking.status === 'In Progress' ? 'animate-spin' : ''}`} />
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/worker/tasks/${booking.id}`}>
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-12">
                <p className='text-lg mb-2'>You have no tasks assigned.</p>
                <p className='mb-4'>Check back later for new jobs.</p>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
