
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { DollarSign, Briefcase, Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";

type Booking = {
    id: string;
    serviceName: string;
    customerName: string;
    status: 'Pending Manager Approval' | 'Worker Assigned' | 'Completed' | 'Canceled' | 'In Progress';
};

type Worker = {
    displayName: string;
    rating: number;
    tasksCompleted: number;
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline"
};

export default function ManagerDashboardPage() {
    const [stats, setStats] = useState({ totalRevenue: 0, activeBookings: 0, newCustomers: 0, activeWorkers: 0 });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [topWorkers, setTopWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Bookings for stats and recent bookings
                const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
                const allBookings = bookingsSnapshot.docs.map(doc => doc.data());
                
                const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.status === 'Completed' ? booking.servicePrice : 0), 0);
                const activeBookings = allBookings.filter(b => ['Worker Assigned', 'In Progress'].includes(b.status)).length;
                
                const recentBookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(3));
                const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
                setRecentBookings(recentBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));

                // Fetch Users for customer and worker stats
                const usersSnapshot = await getDocs(collection(db, 'users'));
                const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const customers = allUsers.filter(u => u.role === 'customer');
                const workers = allUsers.filter(u => u.role === 'worker');

                // A simple way to get "new" customers - e.g., created in the last 30 days
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 30);
                const newCustomers = customers.filter(c => c.createdAt.toDate() > monthAgo).length;

                const activeWorkers = workers.filter(w => w.verificationStatus === 'Approved').length;
                
                setStats({ totalRevenue, activeBookings, newCustomers, activeWorkers });

                // Set top workers (mocking rating and completed tasks for now)
                setTopWorkers(
                    workers
                        .sort((a,b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0))
                        .slice(0, 3)
                        .map(w => ({
                            displayName: w.displayName,
                            rating: w.rating || 4.5,
                            tasksCompleted: w.tasksCompleted || 0
                        }))
                );

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? <>
                    <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
                </> : <>
                    <StatCard title="Total Revenue" value={`Rs.${stats.totalRevenue.toFixed(2)}`} description="From completed bookings" icon={DollarSign} />
                    <StatCard title="Active Bookings" value={String(stats.activeBookings)} description="Currently in progress" icon={Briefcase} />
                    <StatCard title="New Customers" value={`+${stats.newCustomers}`} description="In the last 30 days" icon={Users} />
                    <Link href="/manager/workers">
                    <StatCard title="Active Workers" value={String(stats.activeWorkers)} description="Verified and available" icon={UserCheck} />
                    </Link>
                </>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
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
                <div className="lg:col-span-1">
                     <Card>
                        <CardHeader>
                            <CardTitle>Top Workers</CardTitle>
                            <CardDescription>Your best performing service providers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {loading ? <Skeleton className="h-40 w-full" /> : (
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Tasks</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topWorkers.map(worker => (
                                        <TableRow key={worker.displayName}>
                                            <TableCell>{worker.displayName}</TableCell>
                                            <TableCell>{worker.rating}</TableCell>
                                            <TableCell>{worker.tasksCompleted}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                           )}
                        </CardContent>
                         <CardFooter>
                            <Button asChild variant="outline" className="ml-auto">
                                <Link href="/manager/workers">View All Workers</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
