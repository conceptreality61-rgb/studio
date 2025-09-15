
'use client';

import { useState, useEffect } from 'react';
import ChatInterface from "@/components/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Phone, Check, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, increment } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type TaskStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Pending Confirmation' | 'Worker Assigned' | 'Canceled';

type TaskDetails = {
    serviceName: string;
    customerName: string;
    location: string;
    date: Timestamp;
    time: string;
    customerPhone: string;
    description: string;
    status: TaskStatus;
    workerId: string;
};

export default function TaskDetailPage() {
    const params = useParams();
    const taskId = params.id as string;
    const { toast } = useToast();
    const [task, setTask] = useState<TaskDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) return;
            try {
                const docRef = doc(db, 'bookings', taskId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTask(docSnap.data() as TaskDetails);
                }
            } catch (error) {
                console.error("Error fetching task:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch task details.' });
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [taskId, toast]);

    const handleUpdateStatus = async (newStatus: TaskStatus) => {
        if (!task) return;
        setActionLoading(true);
        try {
            const taskRef = doc(db, 'bookings', taskId);
            await updateDoc(taskRef, { status: newStatus });

            if (newStatus === 'Completed') {
                // Increment worker's completed tasks count
                const workerRef = doc(db, 'users', task.workerId);
                await updateDoc(workerRef, {
                    tasksCompleted: increment(1)
                });
            }

            setTask(prev => prev ? { ...prev, status: newStatus } : null);
            toast({ title: `Task ${newStatus}`, description: 'The task status has been updated.' });
        } catch (error) {
            console.error("Error updating task status:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update task status.' });
        } finally {
            setActionLoading(false);
        }
    };

    const status = task?.status;
    const canStart = status === 'Worker Assigned';

    const getStatusVariant = () => {
        switch (status) {
            case 'In Progress': return 'secondary';
            case 'Completed': return 'default';
            case 'Worker Assigned': return 'outline';
            case 'Canceled': return 'destructive';
            default: return 'outline';
        }
    };
    
    if (loading) {
        return (
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
                <div className="lg:col-span-1"><Skeleton className="h-96" /></div>
            </div>
        )
    }

    if (!task) {
        return <p>Task not found.</p>
    }

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Task Details: #{taskId.substring(0, 6)}</CardTitle>
                                <CardDescription>{task.serviceName} for {task.customerName}</CardDescription>
                            </div>
                             <Badge variant={getStatusVariant()}>{status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Location</p>
                                    <p className="text-muted-foreground">{task.location || 'Not specified'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Date & Time</p>
                                    <p className="text-muted-foreground">{task.date.toDate().toLocaleDateString()} at {task.time}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Customer</p>
                                    <p className="text-muted-foreground">{task.customerName}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Contact</p>
                                    <p className="text-muted-foreground">{status === 'In Progress' ? (task.customerPhone || 'Not available') : 'Protected'}</p>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                            <h4 className="font-semibold mb-2">Task Description</h4>
                            <p className="text-muted-foreground">{task.description || 'No description provided.'}</p>
                        </div>
                         <div className="mt-6 flex gap-2">
                             {canStart && <Button onClick={() => handleUpdateStatus('In Progress')} disabled={actionLoading}>
                                {actionLoading && <Loader2 className="mr-2 animate-spin" />} Start Task</Button>}
                             {status === 'In Progress' && <Button onClick={() => handleUpdateStatus('Completed')} disabled={actionLoading}>
                                {actionLoading && <Loader2 className="mr-2 animate-spin" />}<Check className="mr-2" /> Mark as Complete</Button>}
                             {status === 'Completed' && <Button variant="ghost" disabled>Task Completed</Button>}
                             {status === 'Canceled' && <Button variant="destructive" disabled>Task Canceled</Button>}
                         </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 {status !== 'Completed' && status !== 'Canceled' ? (
                    <ChatInterface chatWith={status === 'In Progress' ? 'customer' : 'admin'} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Chat Closed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground">This task is {status}. Chat is no longer available.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
