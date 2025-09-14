'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { handleRouteRequest, type RouteServiceRequestOutput } from './actions';
import { Loader2, UserCheck } from 'lucide-react';

const RouteServiceRequestInputSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  customerLocation: z.string().min(1, 'Customer location is required'),
  requestedTime: z.string().min(1, 'Requested time is required'),
  workerSkills: z.string().min(1, 'Worker skills are required'),
});

type FormValues = z.infer<typeof RouteServiceRequestInputSchema>;

export default function SmartRouterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteServiceRequestOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(RouteServiceRequestInputSchema),
    defaultValues: {
      serviceType: 'Gardening',
      customerLocation: '123 Main St, Anytown, USA',
      requestedTime: 'Tomorrow at 2:00 PM',
      workerSkills: 'Lawn mowing, Pruning',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);

    const input = {
      ...data,
      workerSkills: data.workerSkills.split(',').map((skill) => skill.trim()),
    };

    const response = await handleRouteRequest(input);

    if (response.success && response.data) {
      setResult(response.data);
      toast({
        title: 'Worker Found!',
        description: `Worker ${response.data.workerId} has been assigned.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error || 'Failed to route service request.',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Service Request Router</CardTitle>
          <CardDescription>
            Automatically route service requests to the best available worker based on skills, availability, and location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Maid Service">Maid Service</SelectItem>
                        <SelectItem value="Bathroom Cleaning">Bathroom Cleaning</SelectItem>
                        <SelectItem value="Tank Cleaning">Tank Cleaning</SelectItem>
                        <SelectItem value="Gardening">Gardening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requestedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tomorrow at 2 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workerSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pruning, Weeding" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Worker...
                  </>
                ) : (
                  'Route Request'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-accent/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Assignment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-lg">
            <p>
              <strong>Assigned Worker ID:</strong> <span className="font-mono p-1 bg-muted rounded">{result.workerId}</span>
            </p>
            <p>
              <strong>Estimated Arrival Time:</strong> <span className="font-mono p-1 bg-muted rounded">{result.estimatedArrivalTime}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
