
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { DollarSign, Briefcase, Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentBookings = [
    { id: 'BK002', service: 'Gardening', customer: 'Olivia Smith', status: 'Worker Assigned' },
    { id: 'BK005', service: 'Maid Service', customer: 'Liam Johnson', status: 'Pending Manager Approval' },
    { id: 'BK001', service: 'Maid Service', customer: 'Liam Johnson', status: 'Completed' },
];

const topWorkers = [
    { name: 'Jane Smith', rating: '4.9', completed: 32 },
    { name: 'John Doe', rating: '4.8', completed: 28 },
    { name: 'Lucas H.', rating: '4.8', completed: 25 },
]

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "Worker Assigned": "secondary",
  "Pending Manager Approval": "outline"
};

export default function ManagerDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value="$25,231.89" description="+20.1% from last month" icon={DollarSign} />
                <StatCard title="Active Bookings" value="52" description="+12 from last month" icon={Briefcase} />
                <StatCard title="New Customers" value="89" description="+35 this month" icon={Users} />
                <Link href="/manager/workers">
                  <StatCard title="Active Workers" value="12" description="2 pending verification" icon={UserCheck} />
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>A summary of recent customer bookings.</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                        <TableCell>{booking.service}</TableCell>
                                        <TableCell>{booking.customer}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[booking.status] || 'default'}>{booking.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
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
                                        <TableRow key={worker.name}>
                                            <TableCell>{worker.name}</TableCell>
                                            <TableCell>{worker.rating}</TableCell>
                                            <TableCell>{worker.completed}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
