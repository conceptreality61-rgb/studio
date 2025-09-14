
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { getSmartRoute } from './actions';
import { RouteServiceRequestInput, RouteServiceRequestOutput } from '@/ai/flows/route-service-requests';
import { services } from '@/lib/constants';

type FormValues = RouteServiceRequestInput;

export default function SmartRouterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RouteServiceRequestOutput | null>(null);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsLoading(true);
        setResult(null);
        try {
            // The workerSkills need to be an array of strings
            const formData = {
                ...data,
                workerSkills: (data.workerSkills as unknown as string).split(',').map(s => s.trim()),
            };
            const response = await getSmartRoute(formData);
            setResult(response);
        } catch (error) {
            console.error("Error getting smart route:", error);
            // You can add a toast notification here to show the error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>AI-Powered Service Router</CardTitle>
                        <CardDescription>
                            Automatically route a service request to the best available worker using AI.
                            Fill in the details below to find the most suitable worker.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="serviceType">Service Type</Label>
                             <Select {...register('serviceType', { required: 'Service type is required' })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(service => (
                                        <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customerLocation">Customer Location</Label>
                            <Input id="customerLocation" {...register('customerLocation', { required: 'Customer location is required' })} placeholder="e.g., 123 Main St, Anytown" />
                            {errors.customerLocation && <p className="text-sm text-destructive">{errors.customerLocation.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="requestedTime">Requested Time</Label>
                            <Input id="requestedTime" type="datetime-local" {...register('requestedTime', { required: 'Requested time is required' })} />
                            {errors.requestedTime && <p className="text-sm text-destructive">{errors.requestedTime.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workerSkills">Required Skills</Label>
                            <Textarea id="workerSkills" {...register('workerSkills', { required: 'At least one skill is required' })} placeholder="e.g., Lawn Mowing, Deep Cleaning" />
                            {errors.workerSkills && <p className="text-sm text-destructive">{errors.workerSkills.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Find Worker
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Routing Result</CardTitle>
                    <CardDescription>The best worker for the job will be displayed here.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : result ? (
                        <div className="text-center space-y-2">
                            <p className="text-lg">Assigned Worker:</p>
                            <p className="text-2xl font-bold text-primary">{result.workerId}</p>
                            <p className="text-lg mt-4">Estimated Arrival:</p>
                            <p className="text-2xl font-bold text-primary">{result.estimatedArrivalTime}</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Submit the form to see the result.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
