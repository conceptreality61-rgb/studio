
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, startOfWeek, endOfDay, startOfDay, getYear, getMonth, setYear, setMonth } from 'date-fns';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Booking = {
    id: string;
    serviceName: string;
    customerName: string;
    status: 'Pending Manager Approval' | 'Pending Worker Assignment' | 'Pending Customer Approval' | 'Worker Assigned' | 'Completed' | 'Canceled' | 'In Progress';
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

const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - i);
const months = Array.from({ length: 12 }, (_, i) => ({ value: i, name: format(new Date(0, i), 'MMMM') }));


export default function ManagerDashboardPage() {
    const [allData, setAllData] = useState<AllData>({ bookings: [], users: [], workers: []});
    const [stats, setStats] = useState({ totalRevenue: 0, activeBookings: 0, newCustomers: 0, totalWorkers: 0 });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [filterPreset, setFilterPreset] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);


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

        let fromDate: Date | undefined;
        let toDate: Date | undefined = endOfDay(new Date());

        if (filterPreset !== 'all') {
            switch(filterPreset) {
                case 'month':
                    fromDate = startOfMonth(new Date());
                    break;
                case '30days':
                    fromDate = startOfDay(subDays(new Date(), 29));
                    break;
                case '7days':
                    fromDate = startOfDay(subDays(new Date(), 6));
                    break;
                case 'custom':
                    if (dateRange?.from) {
                        fromDate = startOfDay(dateRange.from);
                        toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
                    }
                    break;
                case 'monthYear':
                     if (selectedYear !== null && selectedMonth !== null) {
                        const newDate = setYear(setMonth(new Date(), selectedMonth), selectedYear);
                        fromDate = startOfMonth(newDate);
                        toDate = endOfDay(newDate);
                    }
                    break;
            }
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
        
        const totalRevenue = filteredRevenueBookings.reduce((sum, booking) => sum + (booking.estimatedCharge || 0), 0);
        
        const activeBookings = bookings.filter(b => b.status !== 'Canceled').length;
        
        const customers = users.filter(u => u.role === 'customer');
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        const newCustomers = customers.filter(c => c.createdAt && c.createdAt.toDate() > monthAgo).length;

        const totalWorkers = workers.length;

        setStats({ totalRevenue, activeBookings, newCustomers, totalWorkers });

    }, [loading, allData, filterPreset, dateRange, selectedMonth, selectedYear]);

    const handlePresetChange = (value: string) => {
        setFilterPreset(value);
        setDateRange(undefined);
        setSelectedMonth(null);
        setSelectedYear(null);
    }
    
    const handleMonthChange = (value: string) => {
        setSelectedMonth(parseInt(value));
        setFilterPreset('monthYear');
        if (selectedYear === null) setSelectedYear(getYear(new Date()));
    }
    
    const handleYearChange = (value: string) => {
        setSelectedYear(parseInt(value));
        setFilterPreset('monthYear');
        if (selectedMonth === null) setSelectedMonth(getMonth(new Date()));
    }


    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? <>
                    <Skeleton className="h-36" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
                </> : <>
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rs.{stats.totalRevenue.toFixed(2)}</div>
                             <div className="flex flex-col gap-2 mt-2">
                                <Select value={filterPreset} onValueChange={handlePresetChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a filter preset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                        <SelectItem value="30days">Last 30 Days</SelectItem>
                                        <SelectItem value="7days">Last 7 Days</SelectItem>
                                        <SelectItem value="custom" disabled>Custom Range</SelectItem>
                                        <SelectItem value="monthYear" disabled>Month & Year</SelectItem>
                                    </SelectContent>
                                </Select>

                                {(filterPreset === 'monthYear') && (
                                    <div className="flex gap-2">
                                         <Select value={selectedMonth !== null ? String(selectedMonth) : undefined} onValueChange={handleMonthChange}>
                                            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                                            <SelectContent>
                                                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedYear !== null ? String(selectedYear) : undefined} onValueChange={handleYearChange}>
                                            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                                            <SelectContent>
                                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn("w-full justify-start text-left font-normal", filterPreset !== 'custom' && "text-muted-foreground")}
                                            onClick={() => setFilterPreset('custom')}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                                                ) : format(dateRange.from, "LLL dd, y")
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
                                            onSelect={(range) => { setDateRange(range); setFilterPreset('custom'); }}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                             </div>
                        </CardContent>
                    </Card>
                    <Link href="/manager/bookings">
                        <StatCard title="Total Bookings" value={String(stats.activeBookings)} description="Total bookings across all statuses" icon={Briefcase} />
                    </Link>
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
