
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderTracker from "@/components/order-tracker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MapPin, Calendar, Clock, DollarSign, Briefcase, UserCheck, Loader2, CheckCircle, XCircle, AlertTriangle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignWorkerToBooking, acceptJob, refuseJob, completeJob, submitEstimate } from './actions';
import { useToast } from '@/hooks/use-toast';
import { addHours, differenceInHours, startOfDay, endOfDay } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { services } from '@/lib/constants';

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
  estimatedCharge?: number;
  options: Record<string, string | string[]>;
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

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "info" | "warning" } = {
  Completed: "default",
  "Worker Assigned": "info",
  "Pending Manager Approval": "outline",
  "Pending Customer Approval": "warning",
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
  const [estimatedCharge, setEstimatedCharge] = useState<number | string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReassigning, setIsReassigning] = useState(false);
  
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

  const calculatedEstimate = useMemo(() => {
    if (!booking) return 0;
    const service = services.find(s => s.id === booking.serviceId);
    if (!service) return 0;

    let total = service.price; // Start with base price
    let duration = 1;
    let bathroomMultiplier = 1;
    let tankMultiplier = 1;

    // Get duration
    const durationOption = booking.options.duration as string;
    if (durationOption) {
        duration = parseInt(durationOption.split('-')[0]) || 1;
    }

    // Get bathroom count
    const bathroomOption = booking.options['num-bathrooms'] as string;
    if (bathroomOption) {
        bathroomMultiplier = parseInt(bathroomOption.split('-')[0]) || 1;
    }

    // Get tank count
    const tankOption = booking.options['num-tanks'] as string;
    if (tankOption) {
        tankMultiplier = parseInt(tankOption.split('-')[0]) || 1;
    }
    
    // Apply logic based on service type
    if (service.id === 'house-cleaning' || service.id === 'gardening' || service.id === 'bathroom-cleaning') {
      // Priced per hour
      total = service.price * duration;
      if (service.id === 'bathroom-cleaning') {
        total *= bathroomMultiplier; // price * duration * number of bathrooms
      }
    } else if (service.id === 'tank-cleaning') {
      // Flat rate, modified by tank count
      total = service.price * tankMultiplier;
    }
    
    return total;
  }, [booking]);

  useEffect(() => {
    if (calculatedEstimate > 0) {
      setEstimatedCharge(calculatedEstimate);
    }
  }, [calculatedEstimate]);


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

          if (['Pending Manager Approval', 'Worker Assigned', 'In Progress'].includes(bookingData.status)) {
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
  }, [params.id, toast, booking?.status]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const handleSubmitEstimate = async () => {
    if (!booking || !estimatedCharge) return;
    setIsSubmitting(true);
    const charge = typeof estimatedCharge === 'string' ? parseFloat(estimatedCharge) : estimatedCharge;
    const result = await submitEstimate(booking.id, charge);
    if (result.success) {
      toast({ title: 'Estimate Submitted', description: 'The customer has been notified for approval.' });
      setBooking(prev => prev ? { ...prev, status: 'Pending Customer Approval', estimatedCharge: charge } : null);
    } else {
      toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
    }
    setIsSubmitting(false);
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
          setIsReassigning(false);
      } else {
          toast({ variant: 'destructive', title: 'Assignment Failed', description: result.error });
      }
      setIsAssigning(false);
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
    if (!booking || !booking.workerId) return;
    setIsSubmitting(true);
    const result = await refuseJob(booking.id, booking.workerId);
    if (result.success) {
      toast({ title: 'Job Refused', description: 'The job has been returned for re-assignment.' });
      setBooking(prev => prev ? { ...prev, status: 'Pending Manager Approval', workerId: undefined, workerName: undefined, refusedBy: [...(prev.refusedBy || []), prev.workerId!] } : null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };
  
  const handleComplete = async () => {
    if (!booking) return;
    setIsSubmitting(true);
    const result = await completeJob(booking.id);
    if (result.success) {
      toast({ title: 'Job Completed!', description: 'The job has been marked as completed.' });
      setBooking(prev => prev ? { ...prev, status: 'Completed' } : null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  const isAssignmentDisabled = isAssigning || !selectedWorkerId || selectedWorkerId === booking?.workerId;
  
  const renderWorkerAssignment = () => {
       if (loading) return <Skeleton className="h-10 w-full" />;
       if (workers.length > 0) {
        return (
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
                    {isReassigning ? 'Confirm Re-assignment' : 'Assign'}
                </Button>
                {isReassigning && <Button variant="ghost" onClick={() => setIsReassigning(false)}>Cancel</Button>}
            </div>
        );
       }
       return <p className="text-sm text-muted-foreground">No qualified and available workers found for this service and time slot.</p>
  }


  const renderActions = () => {
    if (!booking) return null;

    switch (booking.status) {
      case 'Pending Manager Approval':
        return (
          <>
            {!booking.estimatedCharge ? (
              <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Calculator /> Calculate Estimate & Send for Approval</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col md:flex-row md:items-end gap-4'>
                  <div className='flex-1'>
                    <h4 className='font-semibold'>Calculation based on selection:</h4>
                    <p className='text-sm text-muted-foreground'>
                      Service Base: Rs. {booking.servicePrice}, based on customer's selected options.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated-charge">Final Estimated Charge (Rs.)</Label>
                    <Input id="estimated-charge" type="number" value={estimatedCharge} onChange={(e) => setEstimatedCharge(e.target.value)} placeholder="e.g., 500" className="max-w-[200px] text-lg font-bold" />
                  </div>
                  <Button onClick={handleSubmitEstimate} disabled={isSubmitting || !estimatedCharge}>
                    {isSubmitting && <Loader2 className="animate-spin" />} Send to Customer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <h3 className="font-semibold mb-4 text-lg">Assign Worker</h3>
                {renderWorkerAssignment()}
                {booking?.refusedBy && booking.refusedBy.length > 0 && (
                  <p className="text-xs text-destructive mt-2">Note: This job was previously refused by {booking.refusedBy.length} worker(s).</p>
                )}
              </>
            )}
          </>
        );

      case 'Pending Customer Approval':
        return (
          <div className="flex items-center gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <AlertTriangle className="text-yellow-500" />
            <div>
              <p className="font-semibold">Waiting for Customer</p>
              <p className="text-sm text-muted-foreground">The estimated charge of Rs. {booking.estimatedCharge} has been sent. Awaiting customer acceptance or rejection.</p>
            </div>
          </div>
        );

      case 'Worker Assigned':
        if(isReassigning) {
            return (
                <>
                    <h3 className="font-semibold mb-4 text-lg">Re-assign Worker</h3>
                    {renderWorkerAssignment()}
                </>
            )
        }
        return (
            <>
                <h3 className="font-semibold mb-4 text-lg">Worker Actions</h3>
                <div className="flex items-center gap-4">
                    <Button size="sm" variant="outline" onClick={() => setIsReassigning(true)} disabled={isSubmitting}>
                        Re-assign Worker
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleRefuse} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <XCircle />}
                        Refuse Job
                    </Button>
                    <Button size="sm" onClick={handleAccept} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        Accept Job
                    </Button>
                </div>
            </>
        );
    
      case 'In Progress':
        if(isReassigning) {
            return (
                <>
                    <h3 className="font-semibold mb-4 text-lg">Re-assign Worker</h3>
                    {renderWorkerAssignment()}
                </>
            )
        }
        return (
            <>
                <h3 className="font-semibold mb-4 text-lg">Update Progress</h3>
                <div className="flex items-center gap-4">
                    <Button size="sm" variant="outline" onClick={() => setIsReassigning(true)} disabled={isSubmitting}>
                        Re-assign Worker
                    </Button>
                     <Button size="sm" variant="destructive" onClick={handleRefuse} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <XCircle />}
                        Refuse Job
                    </Button>
                    <Button size="sm" onClick={handleComplete} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                        Mark as Complete
                    </Button>
                </div>
            </>
        );

      default:
        return null;
    }
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
                        <div className="flex items-center gap-3 text-base"><DollarSign className="w-4 h-4 text-muted-foreground" /> <strong>Total:</strong> <strong className="text-primary">{booking.estimatedCharge ? `Rs. ${booking.estimatedCharge}` : `Rs.${booking.servicePrice}/hr (Base)`}</strong></div>
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
            {booking && !['Completed', 'Canceled'].includes(booking.status) && (
                <div className="md:col-span-2">
                    <Separator />
                    <div className="pt-6">
                       {renderActions()}
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

    