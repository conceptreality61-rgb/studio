
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, updateDoc, arrayUnion, fieldValue } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MapPin, Calendar, Clock, DollarSign, Briefcase, UserCheck, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import OrderTracker from '@/components/order-tracker';
import { acceptJob, refuseJob } from './actions';

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  time: string;
  servicePrice: number;
  status: 'Worker Assigned' | 'In Progress' | 'Completed' | 'Canceled';
  userId: string;
  customerName: string;
};

type CustomerProfile = {
    address?: string;
};

const statusVariant: { [key: string]: any } = {
  'Worker Assigned': "info",
  'In Progress': "secondary",
  Completed: "success",
  Canceled: "warning"
};

export default function WorkerTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
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
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Booking not found.' });
          router.push('/worker/tasks');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: 'destructive', title: "Error", description: "Failed to fetch task details." });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.id, toast, router]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const handleAccept = async () => {
    if (!booking) return;
    setIsSubmitting(true);
    const result = await acceptJob(booking.id);
    if (result.success) {
      toast({ title: 'Job Accepted!', description: 'The job status has been updated to "In Progress".' });
      setBooking(prev => prev ? { ...prev, status: 'In Progress' } : null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };
  
  const handleRefuse = async () => {
    if (!booking || !user) return;
    setIsSubmitting(true);
    const result = await refuseJob(booking.id, user.uid);
    if (result.success) {
      toast({ title: 'Job Refused', description: 'The job has been returned to the manager for re-assignment.' });
      router.push('/worker/tasks');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
        </div>
    )
  }

  if (!booking) return null;

  return (
    <div className="grid gap-6">
        <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Task #{params.id.toString().substring(0, 6)}</CardTitle>
                    <CardDescription>Details for the assigned service booking.</CardDescription>
                </div>
                <Badge variant={statusVariant[booking.status] || 'default'} className="text-base">{booking.status}</Badge>
            </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-semibold mb-4 text-lg">Job Details</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.serviceName}</span></div>
                    <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{formatDate(booking.date)}</span></div>
                    <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.time}</span></div>
                    <Separator className="my-4" />
                    <div className="flex items-center gap-3 text-base"><DollarSign className="w-4 h-4 text-muted-foreground" /> <strong>Payment:</strong> <strong className="text-primary">Rs.{booking.servicePrice}/hr</strong></div>
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-4 text-lg">Customer Details</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3"><User className="w-4 h-4 text-muted-foreground" /> <span className="font-medium">{booking.customerName}</span></div>
                    <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" /> <span className="font-medium">{customer?.address || 'No address provided.'}</span></div>
                </div>
            </div>
        </CardContent>
        {booking.status === 'Worker Assigned' && (
            <CardFooter className="border-t pt-6 flex justify-end gap-4">
                <Button variant="destructive" onClick={handleRefuse} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <XCircle />}
                    Refuse Job
                </Button>
                <Button onClick={handleAccept} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                    Accept Job
                </Button>
            </CardFooter>
        )}
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Job Status Tracker</CardTitle>
                <CardDescription>Follow the progress of the service.</CardDescription>
            </CardHeader>
            <CardContent>
                <OrderTracker status={booking.status} />
            </CardContent>
        </Card>
    </div>
  );
}
