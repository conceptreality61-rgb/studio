
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderTracker from "@/components/order-tracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MapPin, Calendar, Clock, DollarSign, Briefcase, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignWorkerToBooking } from './actions';
import { useToast } from '@/hooks/use-toast';
import { addHours, differenceInHours, startOfDay, endOfDay } from 'date-fns';

type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  date: Timestamp;
  time: string;
  workerId?: string;
  workerName?: string;
  servicePrice: number;
  status: string;
  userId: string;
  customerName: string;
  refusedBy?: string[];
  canceledWorkerIds?: string[];
};

type CustomerProfile = {
    address?: string;
    mobile?: {
        countryCode: string;
        number: string;
    };
};

type Worker = {
    id: string;
    displayName: string;
    services: string[];
    status: 'Active' | 'Inactive';
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline",
  "In Progress": "secondary",
  Canceled: "destructive"
};

export default function ManagerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // A helper function to parse time strings like "09:00 AM" into a Date object
  const parseTime = (date: Date, timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };


  useEffect(() => {
    const fetchBookingAndWorkers = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        // Fetch booking
        const docRef = doc(db, 'bookings', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const bookingData = { id: docSnap.id, ...docSnap.data() } as Booking;
          setBooking(bookingData);
          
          if (bookingData.userId) {
              const userDocRef = doc(db, 'users', bookingData.userId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                  setCustomer(userDocSnap.data() as CustomerProfile);
              }
          }

          if (['Pending Manager Approval', 'Worker Assigned'].includes(bookingData.status)) {
            const bookingDate = bookingData.date.toDate();
            const startOfBookingDay = startOfDay(bookingDate);
            const endOfBookingDay = endOfDay(bookingDate);

            // 1. Fetch all bookings for the same day
            const bookingsQuery = query(
              collection(db, 'bookings'),
              where('date', '>=', startOfBookingDay),
              where('date', '<=', endOfBookingDay)
            );
            const dayBookingsSnapshot = await getDocs(bookingsQuery);
            const dayBookings = dayBookingsSnapshot.docs.map(d => d.data() as Booking);

            // 2. Fetch all active workers
            const workersQuery = query(
                collection(db, 'workers'), 
                where('status', '==', 'Active')
            );
            const workersSnapshot = await getDocs(workersQuery);
            const allWorkersData = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
            
            // Sort workers by display name client-side
            allWorkersData.sort((a, b) => a.displayName.localeCompare(b.displayName));

            // 3. Filter workers by service qualification and who haven't refused this job
            const qualifiedWorkers = allWorkersData.filter(worker => 
              worker.services?.includes(bookingData.serviceId) &&
              !bookingData.refusedBy?.includes(worker.id)
            );

            // 4. Filter out workers with scheduling conflicts
            const currentBookingTime = parseTime(bookingDate, bookingData.time);

            const availableWorkers = qualifiedWorkers.filter(worker => {
              const workerBookings = dayBookings.filter(b => b.workerId === worker.id && b.id !== bookingData.id);
              if (workerBookings.length === 0) return true; // Worker is free

              // Check for conflicts
              return workerBookings.every(wb => {
                const existingBookingTime = parseTime(wb.date.toDate(), wb.time);
                const hoursDifference = Math.abs(differenceInHours(currentBookingTime, existingBookingTime));
                return hoursDifference >= 2;
              });
            });

            setWorkers(availableWorkers);
          }

        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: 'destructive', title: "Error", description: "Failed to fetch booking details." });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndWorkers();
  }, [params.id, toast]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  const handleAssignWorker = async () => {
      if (!selectedWorkerId || !booking) return;

      setIsAssigning(true);
      const worker = workers.find(w => w.id === selectedWorkerId);
      if (!worker) {
          setIsAssigning(false);
          toast({ variant: 'destructive', title: 'Error', description: 'Selected worker not found.' });
          return;
      }
      
      const previousWorkerId = booking.workerId;
      const result = await assignWorkerToBooking(booking.id, worker.id, worker.displayName, previousWorkerId);

      if (result.success) {
          toast({ title: 'Worker Assigned', description: `Assigned ${worker.displayName} to the booking.` });
          // Optimistically update UI
          setBooking(prev => prev ? { ...prev, status: 'Worker Assigned', workerId: worker.id, workerName: worker.displayName } : null);
          setSelectedWorkerId(undefined);
      } else {
          toast({ variant: 'destructive', title: 'Assignment Failed', description: result.error });
      }
      setIsAssigning(false);
  }
  
  const isAssignmentDisabled = isAssigning || !selectedWorkerId || selectedWorkerId === booking?.workerId;

  return (
    <div className="grid gap-6">
        <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Booking #{params.id.toString().substring(0, 6)}</CardTitle>
                    <CardDescription>Details for the service booking.</CardDescription>
                </div>
                {booking && <Badge variant={statusVariant[booking.status] || 'default'} className="text-base">{booking.status}</Badge>}
            </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-semibold mb-4 text-lg">Order Summary</h3>
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
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.serviceName}</span></div>
                        <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{formatDate(booking.date)}</span></div>
                        <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.time}</span></div>
                        <div className="flex items-center gap-3"><UserCheck className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.workerName || 'Not assigned yet'}</span></div>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-3 text-base"><DollarSign className="w-4 h-4 text-muted-foreground" /> <strong>Total:</strong> <strong className="text-primary">Rs.{booking.servicePrice}/hr</strong></div>
                    </div>
                ) : (
                    <p>Booking details not found.</p>
                )}
            </div>
            <div>
                <h3 className="font-semibold mb-4 text-lg">Customer Details</h3>
                 {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                ) : booking && customer ? (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3"><User className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.customerName}</span></div>
                        <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" /> <span className="font-medium">{customer.address || 'No address provided.'}</span></div>
                    </div>
                 ) : (
                    <p>Customer details not found.</p>
                 )}
            </div>
            {booking && ['Pending Manager Approval', 'Worker Assigned'].includes(booking.status) && (
                <div className="md:col-span-2">
                    <Separator />
                    <div className="pt-6">
                        <h3 className="font-semibold mb-4 text-lg">{booking.status === 'Worker Assigned' ? 'Replace Worker' : 'Assign Worker'}</h3>
                        {loading ? <Skeleton className="h-10 w-full" /> : workers.length > 0 ? (
                            <div className="flex items-center gap-4">
                                <Select onValueChange={setSelectedWorkerId} value={selectedWorkerId}>
                                    <SelectTrigger className="w-[280px]">
                                        <SelectValue placeholder="Select an available worker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workers.map(worker => (
                                            <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAssignWorker} disabled={isAssignmentDisabled}>
                                    {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {booking.status === 'Worker Assigned' ? 'Replace' : 'Assign'}
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No qualified and available workers found for this service and time slot.</p>
                        )}
                        {booking?.refusedBy && booking.refusedBy.length > 0 && (
                            <p className="text-xs text-destructive mt-2">Note: This job was previously refused by {booking.refusedBy.length} worker(s).</p>
                        )}
                    </div>
                </div>
            )}
        </CardContent>
        <CardFooter>
            <Button variant="outline" asChild>
                <Link href="/manager/bookings">Back to All Bookings</Link>
            </Button>
        </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Live Status Tracker</CardTitle>
                <CardDescription>Follow the progress of the service booking.</CardDescription>
            </CardHeader>
            <CardContent>
                <OrderTracker status={booking?.status} />
            </CardContent>
        </Card>
    </div>
  );
}
