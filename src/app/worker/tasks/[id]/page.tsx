import ChatInterface from "@/components/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Task Details: #{params.id}</CardTitle>
                        <CardDescription>Gardening for Olivia Smith</CardDescription>
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
                                    <p className="text-muted-foreground">(555) 123-4567</p>
                                </div>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div>
                            <h4 className="font-semibold mb-2">Task Description</h4>
                            <p className="text-muted-foreground">General garden maintenance including lawn mowing, weeding the front flower beds, and pruning the rose bushes. Customer has a lawnmower available in the shed.</p>
                        </div>
                         <div className="mt-6 flex gap-2">
                             <Button>Start Task</Button>
                             <Button variant="outline">Decline Task</Button>
                         </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <ChatInterface />
            </div>
        </div>
    );
}
