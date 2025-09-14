
'use client';

import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { DollarSign, Briefcase, Star, Clock, CheckCircle, CalendarCheck, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const availableTasks = [
    { id: 'TSK006', service: 'Bathroom Cleaning', customer: 'Emma Brown', date: '2023-06-26', status: 'Available' },
    { id: 'TSK007', service: 'Maid Service', customer: 'Ava Jones', date: '2023-06-27', status: 'Available' },
];

const workerServices = ['Gardening', 'Maid Service', 'Bathroom Cleaning'];

const workerAvailability = {
    from: new Date('2024-07-01'),
    to: new Date('2024-07-31'),
};


export default function WorkerDashboardPage() {
    const [tasks, setTasks] = useState(availableTasks);

    const handleAcceptTask = (taskId: string) => {
        setTasks(currentTasks => 
            currentTasks.map(task => 
                task.id === taskId ? { ...task, status: 'Pending Manager Approval' } : task
            )
        );
    };

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
                            <CardTitle>Available Tasks</CardTitle>
                            <CardDescription>Tasks matching your skills. Accept them to get assigned.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.service}</TableCell>
                                        <TableCell>{task.customer}</TableCell>
                                        <TableCell>{task.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={task.status === 'Available' ? 'outline' : 'secondary'}>{task.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {task.status === 'Available' ? (
                                                <Button size="sm" onClick={() => handleAcceptTask(task.id)}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Accept Task
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" disabled>
                                                    Pending Approval
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" className="ml-auto">
                                <Link href="/worker/tasks">View All My Tasks</Link>
                            </Button>
                        </CardFooter>
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
