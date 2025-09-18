
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Booking = {
  id: string;
  serviceName: string;
  customerName: string;
  workerId?: string;
  workerName?: string;
  date: Timestamp;
  status: 'Pending Manager Approval' | 'Worker Assigned' | 'Completed' | 'Canceled' | 'In Progress';
  servicePrice: number;
};

type Worker = {
    id: string;
    displayName: string;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};

const rowStatusHighlight: { [key: string]: string } = {
  'Pending Manager Approval': 'bg-yellow-100/50 hover:bg-yellow-100/80',
  'Worker Assigned': 'bg-blue-100/50 hover:bg-blue-100/80',
  'In Progress': 'bg-indigo-100/50 hover:bg-indigo-100/80',
  'Completed': 'bg-green-100/50 hover:bg-green-100/80',
  'Canceled': 'bg-red-100/50 hover:bg-red-100/80',
};


export default function ManagerBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                setBookings(bookingsData);

                const workersQuery = query(collection(db, 'workers'), orderBy('displayName'));
                const workersSnapshot = await getDocs(workersQuery);
                const workersData = workersSnapshot.docs.map(doc => ({ id: doc.id, displayName: doc.data().displayName } as Worker));
                setWorkers(workersData);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ variant: 'destructive', title: "Error", description: "Failed to fetch bookings or workers."});
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const handleWorkerChange = async (bookingId: string, workerId: string) => {
        const selectedWorker = workers.find(w => w.id === workerId);
        if (!selectedWorker) return;

        try {
            const bookingRef = doc(db, 'bookings', bookingId);
            await updateDoc(bookingRef, {
                workerId: workerId,
                workerName: selectedWorker.displayName,
                status: 'Worker Assigned'
            });

            setBookings(currentBookings =>
                currentBookings.map(b =>
                    b.id === bookingId ? { 
                        ...b, 
                        workerId: workerId, 
                        workerName: selectedWorker.displayName, 
                        status: 'Worker Assigned' 
                    } : b
                )
            );
            toast({ title: "Worker Assigned", description: `${selectedWorker.displayName} has been assigned to booking #${bookingId.substring(0,6)}.`});
        } catch (error) {
            console.error("Error assigning worker: ", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to assign worker." });
        }
    };
    
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString();
    }


  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>Manage and assign all customer bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map((booking) => (
                <TableRow key={booking.id} className={cn(rowStatusHighlight[booking.status])}>
                    <TableCell className="font-medium">{booking.id.substring(0, 6)}</TableCell>
                    <TableCell>{booking.serviceName}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>
                        {booking.workerName || 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">Rs.{booking.servicePrice}/hr</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/manager/bookings/${booking.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Cancel Booking</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
