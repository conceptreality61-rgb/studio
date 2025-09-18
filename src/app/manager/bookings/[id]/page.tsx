
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

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  time: string;
  workerName?: string;
  servicePrice: number;
  status: string;
  userId: string;
  customerName: string;
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
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);

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
          
          // Fetch customer
          if (bookingData.userId) {
              const userDocRef = doc(db, 'users', bookingData.userId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                  setCustomer(userDocSnap.data() as CustomerProfile);
              }
          }

          // Fetch workers if needed
          if (bookingData.status === 'Pending Manager Approval') {
            const workersQuery = query(collection(db, 'workers'), orderBy('displayName'));
            const workersSnapshot = await getDocs(workersQuery);
            const workersData = workersSnapshot.docs.map(doc => ({ id: doc.id, displayName: doc.data().displayName } as Worker));
            setWorkers(workersData);
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
      
      const result = await assignWorkerToBooking(booking.id, worker.id, worker.displayName);

      if (result.success) {
          toast({ title: 'Worker Assigned', description: `Assigned ${worker.displayName} to the booking.` });
          // Optimistically update UI
          setBooking(prev => prev ? { ...prev, status: 'Worker Assigned', workerName: worker.displayName } : null);
      } else {
          toast({ variant: 'destructive', title: 'Assignment Failed', description: result.error });
      }
      setIsAssigning(false);
  }

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
            {booking?.status === 'Pending Manager Approval' && (
                <div className="md:col-span-2">
                    <Separator />
                    <div className="pt-6">
                        <h3 className="font-semibold mb-4 text-lg">Assign Worker</h3>
                        <div className="flex items-center gap-4">
                            <Select onValueChange={setSelectedWorkerId}>
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Select a worker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {workers.map(worker => (
                                        <SelectItem key={worker.id} value={worker.id}>{worker.displayName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAssignWorker} disabled={!selectedWorkerId || isAssigning}>
                                {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Assign Worker
                            </Button>
                        </div>
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
