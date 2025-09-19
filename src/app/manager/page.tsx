
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { Coins, Briefcase, Users, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, startOfWeek, endOfDay, startOfDay } from 'date-fns';
import { cn } from "@/lib/utils";

type Booking = {
    id: string;
    serviceName: string;
    customerName: string;
    status: 'Pending Manager Approval' | 'Pending Worker Assignment' | 'Worker Assigned' | 'Completed' | 'Canceled' | 'In Progress';
    estimatedCharge?: number;
    createdAt: Timestamp;
    statusHistory?: { status: string; timestamp: Timestamp }[];
};

type AllData = {
    bookings: Booking[];
    users: any[];
    workers: any[];
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

export default function ManagerDashboardPage() {
    const [allData, setAllData] = useState<AllData>({ bookings: [], users: [], workers: []});
    const [stats, setStats] = useState({ totalRevenue: 0, activeBookings: 0, newCustomers: 0, totalWorkers: 0 });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [filter, setFilter] = useState('all');


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data once
                const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
                const allBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const workersSnapshot = await getDocs(collection(db, 'workers'));
                const allWorkers = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Sort recent bookings
                const sortedBookings = [...allBookings].sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis());
                setRecentBookings(sortedBookings.slice(0,5));

                setAllData({ bookings: allBookings, users: allUsers, workers: allWorkers });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (loading) return;

        const { bookings, users, workers } = allData;
        
        const completedBookings = bookings.filter(b => b.status === 'Completed');
        
        let filteredRevenueBookings = completedBookings;

        if (filter !== 'all') {
            let fromDate: Date | undefined;
            let toDate: Date | undefined;

            if (filter === 'month') {
                fromDate = startOfMonth(new Date());
                toDate = new Date();
            } else if (filter === 'week') {
                fromDate = startOfWeek(new Date());
                toDate = new Date();
            } else if (filter === 'custom' && dateRange?.from) {
                fromDate = startOfDay(dateRange.from);
                toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
            }
            
            if (fromDate && toDate) {
                const finalToDate = toDate;
                filteredRevenueBookings = completedBookings.filter(b => {
                    const completionEntry = b.statusHistory?.find(h => h.status === 'Completed');
                    if (!completionEntry) return false;
                    const completionDate = completionEntry.timestamp.toDate();
                    return completionDate >= fromDate! && completionDate <= finalToDate;
                });
            }
        }
        
        const totalRevenue = filteredRevenueBookings.reduce((sum, booking) => sum + (booking.estimatedCharge || 0), 0);
        
        const activeBookings = bookings.filter(b => ['Worker Assigned', 'In Progress'].includes(b.status)).length;
        
        const customers = users.filter(u => u.role === 'customer');
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const newCustomers = customers.filter(c => c.createdAt && c.createdAt.toDate() > monthAgo).length;

        const totalWorkers = workers.length;

        setStats({ totalRevenue, activeBookings, newCustomers, totalWorkers });

    }, [loading, allData, filter, dateRange]);
    
    const handleFilterChange = (value: string) => {
        if (value === 'custom') {
            setFilter('custom');
        } else {
            setDateRange(undefined);
            setFilter(value);
        }
    }


    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? <>
                    <Skeleton className="h-36" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
                </> : <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rs.{stats.totalRevenue.toFixed(2)}</div>
                             <Tabs value={filter} onValueChange={handleFilterChange} className="mt-2">
                                <TabsList className="grid grid-cols-3 h-8 text-xs">
                                    <TabsTrigger value="all">All Time</TabsTrigger>
                                    <TabsTrigger value="month">Month</TabsTrigger>
                                    <TabsTrigger value="week">Week</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("w-full justify-start text-left font-normal mt-2", !dateRange && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Custom Range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => { setDateRange(range); setFilter('custom'); }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                    <StatCard title="Active Bookings" value={String(stats.activeBookings)} description="Currently in progress" icon={Briefcase} />
                    <StatCard title="New Customers" value={`+${stats.newCustomers}`} description="In the last 30 days" icon={Users} />
                    <StatCard title="Total Workers" value={String(stats.totalWorkers)} description="Across all services" icon={UserCheck} />
                </>}
            </div>
            <div className="grid grid-cols-1">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>A summary of the latest customer bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-40 w-full" /> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {recentBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.serviceName}</TableCell>
                                            <TableCell>{booking.customerName}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="ml-auto">
                                <Link href="/manager/bookings">View All Bookings</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
