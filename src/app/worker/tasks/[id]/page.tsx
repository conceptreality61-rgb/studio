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

type TaskStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Pending Confirmation';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const [status, setStatus] = useState<TaskStatus>('In Progress');
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
    
    // This would be fetched from your backend
    const isApproved = status === 'In Progress' || status === 'Completed' || status === 'Pending Confirmation';

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
                             <Badge variant={status === 'In Progress' ? 'secondary' : status === 'Completed' ? 'default' : 'outline'}>{status}</Badge>
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
                                    <p className="text-muted-foreground">{isApproved ? '(555) 123-4567' : 'Protected'}</p>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                            <h4 className="font-semibold mb-2">Task Description</h4>
                            <p className="text-muted-foreground">General garden maintenance including lawn mowing, weeding the front flower beds, and pruning the rose bushes. Customer has a lawnmower available in the shed.</p>
                        </div>
                         <div className="mt-6 flex gap-2">
                             {status === 'Upcoming' && isApproved && <Button onClick={handleStartTask}>Start Task</Button>}
                             {status === 'In Progress' && <Button onClick={handleCompleteTask}><Check className="mr-2" /> Mark as Complete</Button>}
                             {(status === 'Upcoming' && !isApproved) && <Button variant="outline" disabled>Awaiting Admin Approval</Button>}
                             {status === 'Pending Confirmation' && <Button variant="outline" disabled>Waiting for Admin</Button>}
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
