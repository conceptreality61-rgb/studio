'use client';

import { useState } from 'react';
import ChatInterface from "@/components/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Phone, Check, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

type TaskStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Pending Confirmation' | 'Pending Admin Approval' | 'Available';

// Mock data, in a real app this would come from your backend
const taskDetails = {
    'TSK001': { status: 'In Progress', description: 'General garden maintenance including lawn mowing, weeding the front flower beds, and pruning the rose bushes. Customer has a lawnmower available in the shed.' },
    'TSK002': { status: 'Upcoming', description: 'Standard maid service for a 3-bedroom house. Focus on kitchen and bathrooms.' },
    'TSK003': { status: 'Completed', description: 'Deep clean of two bathrooms.' },
    'TSK004': { status: 'Completed', description: 'Cleaning of a 1000L overhead water tank.' },
    'TSK005': { status: 'Upcoming', description: 'Weekly maid service.' },
    'TSK006': { status: 'Pending Admin Approval', description: 'Deep clean of one bathroom.' },
    'TSK007': { status: 'Available', description: 'Full day maid service required.' },
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const taskData = taskDetails[params.id as keyof typeof taskDetails] || { status: 'Upcoming', description: 'No details available.' };
    const [status, setStatus] = useState<TaskStatus>(taskData.status as TaskStatus);
    const { toast } = useToast();
    const router = useRouter();

    const handleStartTask = () => {
        setStatus('In Progress');
        toast({ title: 'Task Started', description: 'You can now contact the customer.' });
    };

    const handleCompleteTask = () => {
        setStatus('Pending Confirmation');
        toast({ title: 'Task Marked as Complete', description: 'Waiting for admin confirmation.' });
    };
    
    const isApproved = status !== 'Pending Admin Approval' && status !== 'Available';
    const canStart = status === 'Upcoming' && isApproved;
    
    const getStatusVariant = () => {
        switch (status) {
            case 'In Progress': return 'secondary';
            case 'Completed': return 'default';
            case 'Pending Admin Approval': return 'outline';
            case 'Upcoming': return 'outline';
            default: return 'outline';
        }
    };

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Task Details: #{params.id}</CardTitle>
                                <CardDescription>Gardening for Olivia Smith</CardDescription>
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
                                    <p className="text-muted-foreground">456 Oak Ave, Upper Town</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Date & Time</p>
                                    <p className="text-muted-foreground">June 24, 2023 at 11:00 AM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Customer</p>
                                    <p className="text-muted-foreground">Olivia Smith</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Contact</p>
                                    <p className="text-muted-foreground">{status === 'In Progress' ? '(555) 123-4567' : 'Protected'}</p>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                            <h4 className="font-semibold mb-2">Task Description</h4>
                            <p className="text-muted-foreground">{taskData.description}</p>
                        </div>
                         <div className="mt-6 flex gap-2">
                             {canStart && <Button onClick={handleStartTask}>Start Task</Button>}
                             {status === 'In Progress' && <Button onClick={handleCompleteTask}><Check className="mr-2" /> Mark as Complete</Button>}
                             {status === 'Pending Admin Approval' && <Button variant="outline" disabled>Awaiting Admin Approval</Button>}
                             {status === 'Pending Confirmation' && <Button variant="outline" disabled>Waiting for Admin Confirmation</Button>}
                             {status === 'Completed' && <Button variant="ghost" disabled>Task Completed</Button>}
                         </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 {isApproved ? (
                    <ChatInterface chatWith={status === 'In Progress' ? 'customer' : 'admin'} />
                ) : (
                    <ChatInterface chatWith="admin" />
                )}
            </div>
        </div>
    );
}
