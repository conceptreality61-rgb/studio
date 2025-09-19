
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { MoreHorizontal, ArrowUpDown, Calendar as CalendarIcon, Search, X } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

type Booking = {
  id: string;
  serviceName: string;
  customerName: string;
  workerId?: string;
  workerName?: string;
  date: Timestamp;
  status: 'Pending Manager Approval' | 'Pending Customer Approval' | 'Worker Assigned' | 'Completed' | 'Canceled' | 'In Progress';
  servicePrice: number;
  refusedBy?: string[];
  canceledWorkerIds?: string[];
  estimatedCharge?: number;
};

type Worker = {
    id: string;
    displayName: string;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning" } = {
  'Pending Manager Approval': "destructive",
  'Pending Customer Approval': 'warning',
  'Worker Assigned': "info",
  'In Progress': "secondary",
  'Completed': "success",
  'Canceled': "warning",
};


export default function ManagerBookingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [workerFilter, setWorkerFilter] = useState<string | null>(null);
    const [refusedByFilter, setRefusedByFilter] = useState<boolean>(false);
    const [reassignedFilter, setReassignedFilter] = useState<boolean>(false);


    useEffect(() => {
        const worker = searchParams.get('worker');
        const status = searchParams.get('status');
        const refused = searchParams.get('refused');
        const reassigned = searchParams.get('reassigned');

        setWorkerFilter(worker);
        setStatusFilter(status);
        setRefusedByFilter(refused === 'true');
        setReassignedFilter(reassigned === 'true');
        setSearchTerm(worker || '');

    }, [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                
                const workersQuery = query(collection(db, 'workers'));
                const workersSnapshot = await getDocs(workersQuery);
                const workersData = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));

                const statusOrder = {
                    'Pending Manager Approval': 1,
                    'Pending Customer Approval': 2,
                    'Worker Assigned': 3,
                    'In Progress': 4,
                    'Completed': 5,
                    'Canceled': 6,
                };
                
                bookingsData.sort((a, b) => {
                    const orderA = statusOrder[a.status] || 99;
                    const orderB = statusOrder[b.status] || 99;
                    if (orderA !== orderB) {
                        return orderA - orderB;
                    }
                    return b.date.toMillis() - a.date.toMillis();
                });
                
                setBookings(bookingsData);
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
    
    useEffect(() => {
        const lowercasedSearch = searchTerm.toLowerCase();
        const workerIdToFilter = workers.find(w => w.displayName === workerFilter)?.id;

        const filteredData = bookings.filter((booking) => {
            const matchesSearchTerm = lowercasedSearch ? (
                booking.id.toLowerCase().includes(lowercasedSearch) ||
                (booking.serviceName && booking.serviceName.toLowerCase().includes(lowercasedSearch)) ||
                (booking.customerName && booking.customerName.toLowerCase().includes(lowercasedSearch)) ||
                (booking.workerName && booking.workerName.toLowerCase().includes(lowercasedSearch))
            ) : true;
            
            const matchesDate = selectedDate
                ? format(booking.date.toDate(), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                : true;
            
            const matchesStatus = statusFilter ? booking.status === statusFilter : true;
            
            const matchesWorker = workerFilter ? (booking.workerId === workerIdToFilter) : true;

            const matchesRefused = refusedByFilter 
                ? (workerIdToFilter && booking.refusedBy?.includes(workerIdToFilter)) 
                : true;

            const matchesReassigned = reassignedFilter
                ? (workerIdToFilter && booking.canceledWorkerIds?.includes(workerIdToFilter))
                : true;

            // When a specific filter like refused or reassigned is active, the general worker match should not exclude it
            if (workerFilter && (refusedByFilter || reassignedFilter)) {
                 return matchesSearchTerm && matchesDate && matchesStatus && (matchesRefused || matchesReassigned);
            }


            return matchesSearchTerm && matchesDate && matchesStatus && matchesWorker && matchesRefused && matchesReassigned;
        });
        setFilteredBookings(filteredData);
    }, [searchTerm, selectedDate, statusFilter, workerFilter, bookings, refusedByFilter, reassignedFilter, workers]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDate(undefined);
        setStatusFilter(null);
        setWorkerFilter(null);
        setRefusedByFilter(false);
        setReassignedFilter(false);
        router.push('/manager/bookings');
    };
    
    const getWorkerNameById = (workerId: string) => {
        return workers.find(w => w.id === workerId)?.displayName || workerId;
    }


    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString();
    }


  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>Manage and assign all customer bookings.</CardDescription>
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by ID, service, customer..."
                className="pl-8 sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full sm:w-auto justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            {(selectedDate || statusFilter || workerFilter || refusedByFilter || reassignedFilter) && <Button variant="ghost" onClick={clearFilters}><X className="mr-2 h-4 w-4"/>Clear Filters</Button>}
        </div>
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
                <TableHead><b>Sl No.</b></TableHead>
                <TableHead><b>Booking ID</b></TableHead>
                <TableHead><b>Service</b></TableHead>
                <TableHead><b>Customer</b></TableHead>
                <TableHead><b>Assigned Worker</b></TableHead>
                 {refusedByFilter && <TableHead><b>Refused By</b></TableHead>}
                 {reassignedFilter && <TableHead><b>Canceled Workers</b></TableHead>}
                <TableHead><b>Date</b></TableHead>
                <TableHead><b>Status</b></TableHead>
                <TableHead className="text-right"><b>Amount</b></TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredBookings.map((booking, index) => (
                <TableRow key={booking.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{booking.id.substring(0, 6)}</TableCell>
                    <TableCell>{booking.serviceName}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>
                        {booking.workerName || 'N/A'}
                    </TableCell>
                    {refusedByFilter && <TableCell>{booking.refusedBy?.map(getWorkerNameById).join(', ') || 'N/A'}</TableCell>}
                    {reassignedFilter && <TableCell>{booking.canceledWorkerIds?.map(getWorkerNameById).join(', ') || 'N/A'}</TableCell>}
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusVariant[booking.status] || 'default'}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{booking.estimatedCharge ? `Rs. ${booking.estimatedCharge}` : `Rs. ${booking.servicePrice}/hr`}</TableCell>
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
