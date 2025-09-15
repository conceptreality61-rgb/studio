
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import { DollarSign, Briefcase, Star, Clock, CheckCircle, CalendarCheck, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Task = {
  id: string;
  serviceName: string;
  customerName: string;
  date: Timestamp;
  status: string;
};

type UserProfile = {
    selectedServices?: Record<string, string[]>;
    availability?: { from: Timestamp, to: Timestamp };
    rating?: number;
}

export default function WorkerDashboardPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({ earnings: 0, completedTasks: 0, nextTaskDate: null as Date | null, nextTaskService: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userProfile = userDoc.data() as UserProfile;
                setProfile(userProfile);
                
                const userSkills = userProfile.selectedServices ? Object.keys(userProfile.selectedServices) : [];

                if (userSkills.length > 0) {
                    const tasksQuery = query(collection(db, 'bookings'), where('status', '==', 'Pending Manager Approval'), where('serviceId', 'in', userSkills));
                    const tasksSnapshot = await getDocs(tasksQuery);
                    const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
                    setAvailableTasks(tasksData);
                }
                
                const assignedTasksQuery = query(collection(db, 'bookings'), where('workerId', '==', user.uid));
                const assignedTasksSnapshot = await getDocs(assignedTasksQuery);
                const assignedTasks = assignedTasksSnapshot.docs.map(d => d.data());

                const completedTasks = assignedTasks.filter(t => t.status === 'Completed').length;
                const earnings = assignedTasks.reduce((acc, task) => task.status === 'Completed' ? acc + task.servicePrice : acc, 0);

                const upcomingTasks = assignedTasks
                    .filter(t => t.status === 'Worker Assigned' && t.date.toDate() > new Date())
                    .sort((a,b) => a.date.toDate() - b.date.toDate());
                
                setStats({
                    earnings,
                    completedTasks,
                    nextTaskDate: upcomingTasks.length > 0 ? upcomingTasks[0].date.toDate() : null,
                    nextTaskService: upcomingTasks.length > 0 ? upcomingTasks[0].serviceName : '',
                });

            } catch (error) {
                console.error("Error fetching worker data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load dashboard data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, toast]);

    const handleAcceptTask = async (taskId: string) => {
        if (!user) return;
        setAvailableTasks(currentTasks => 
            currentTasks.map(task => 
                task.id === taskId ? { ...task, status: 'Accepting...' } : task
            )
        );
        try {
            const taskRef = doc(db, 'bookings', taskId);
            await updateDoc(taskRef, {
                status: 'Worker Assigned',
                workerId: user.uid,
                workerName: user.displayName,
            });
            
            setAvailableTasks(currentTasks => currentTasks.filter(t => t.id !== taskId));
            toast({ title: 'Task Accepted!', description: 'The task has been added to your schedule.' });
        } catch (error) {
            console.error("Error accepting task:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to accept the task.' });
            setAvailableTasks(currentTasks => 
                currentTasks.map(task => 
                    task.id === taskId ? { ...task, status: 'Available' } : task
                )
            );
        }
    };
    
    const timeToNextTask = () => {
        if (!stats.nextTaskDate) return 'No upcoming tasks';
        const diff = stats.nextTaskDate.getTime() - new Date().getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'in less than an hour';
        if (hours < 24) return `in ${hours} hours`;
        return `on ${stats.nextTaskDate.toLocaleDateString()}`;
    };

    const workerServices = profile?.selectedServices ? Object.keys(profile.selectedServices).map(s => s.replace('-', ' ')) : [];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {loading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28" />) : <>
                <StatCard title="This Month's Earnings" value={`Rs.${stats.earnings.toFixed(2)}`} description="Based on completed tasks" icon={DollarSign} />
                <StatCard title="Completed Tasks" value={String(stats.completedTasks)} description="All time" icon={Briefcase} />
                <StatCard title="Your Rating" value={String(profile?.rating?.toFixed(1) || 'N/A')} description="Customer feedback" icon={Star} />
                <StatCard title="Next Task" value={timeToNextTask()} description={stats.nextTaskService} icon={Clock} />
               </>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Tasks</CardTitle>
                            <CardDescription>Tasks matching your skills. Accept them to get assigned.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {loading ? <Skeleton className="h-40" /> : availableTasks.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {availableTasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell>{task.serviceName}</TableCell>
                                        <TableCell>{task.customerName}</TableCell>
                                        <TableCell>{task.date.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" disabled={task.status === 'Accepting...'} onClick={() => handleAcceptTask(task.id)}>
                                                {task.status === 'Accepting...' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                                {task.status === 'Accepting...' ? 'Accepting...' : 'Accept Task'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                           ) : (
                               <p className="text-center text-muted-foreground py-10">No tasks currently available that match your skills.</p>
                           )}
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
                            {loading ? <Skeleton className="h-24" /> : workerServices.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {workerServices.map(service => (
                                        <li key={service} className="flex items-center capitalize">
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                            <span>{service}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">You have not selected any services.</p>
                            )}
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
                            {loading ? <Skeleton className="h-20" /> : profile?.availability?.from ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            {profile.availability.from.toDate().toLocaleDateString()} - {profile.availability.to.toDate().toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">You are available for tasks within this period.</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">You have not set your availability.</p>
                            )}
                            <Button asChild className="w-full mt-4" variant="outline">
                                <Link href="/worker/profile">Renew / Update</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
