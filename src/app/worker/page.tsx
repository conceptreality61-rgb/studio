
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { DollarSign, Briefcase, Star, Clock, ArrowRight, CheckCircle, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const tasks = [
    { id: 'TSK001', service: 'Gardening', customer: 'Olivia Smith', date: '2023-06-24', status: 'In Progress' },
    { id: 'TSK002', service: 'Maid Service', customer: 'John Doe', date: '2023-06-25', status: 'Upcoming' },
];

const workerServices = ['Gardening', 'Maid Service'];

const workerAvailability = {
    from: new Date('2024-07-01'),
    to: new Date('2024-07-31'),
};


export default function WorkerDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="This Month's Earnings" value="$1,250.00" description="+15% from last month" icon={DollarSign} />
                <StatCard title="Completed Tasks" value="32" description="This month" icon={Briefcase} />
                <StatCard title="Your Rating" value="4.9" description="Based on 56 reviews" icon={Star} />
                <StatCard title="Next Task" value="in 2 hours" description="Gardening for O. Smith" icon={Clock} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                            <CardDescription>Your assigned and upcoming jobs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task ID</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">{task.id}</TableCell>
                                        <TableCell>{task.service}</TableCell>
                                        <TableCell>{task.customer}</TableCell>
                                        <TableCell>{task.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={task.status === 'In Progress' ? 'secondary' : 'outline'}>{task.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/worker/tasks/${task.id}`}><ArrowRight className="h-4 w-4" /></Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Services</CardTitle>
                            <CardDescription>Services you are approved for.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                {workerServices.map(service => (
                                    <li key={service} className="flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                        <span>{service}</span>
                                    </li>
                                ))}
                            </ul>
                             <Button asChild className="w-full mt-4" variant="outline">
                                <Link href="/worker/profile">Manage Services</Link>
                             </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Availability</CardTitle>
                            <CardDescription>Your current work schedule.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {workerAvailability && workerAvailability.from && workerAvailability.to ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {workerAvailability.from.toLocaleDateString()} - {workerAvailability.to.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">You are available for tasks within this period.</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">You have not set your availability.</p>
                            )}
                            <Button asChild className="w-full mt-4">
                                <Link href="/worker/profile">Renew / Update</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
