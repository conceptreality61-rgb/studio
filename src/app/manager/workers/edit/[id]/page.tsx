
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { services } from '@/lib/constants';
import { updateWorker } from './actions';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const idTypes = [
    { id: 'aadhar', name: 'Aadhar Card' },
    { id: 'pan', name: 'PAN Card' },
    { id: 'dl', name: 'Driving License' },
    { id: 'voterid', name: 'Voter ID' },
    { id: 'other', name: 'Other' },
]

const idDetailsSchema = z.object({
  type: z.string().min(1, { message: "Please select an ID type." }),
  number: z.string().min(1, { message: "Please enter an ID number." }),
}).superRefine((data, ctx) => {
    if (data.type === 'aadhar' && data.number) {
        if (!/^\d{12}$/.test(data.number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Aadhar number must be 12 digits.',
                path: ['number'],
            });
        }
    } else if (data.type === 'pan' && data.number) {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.number.toUpperCase())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid PAN number format.',
                path: ['number'],
            });
        }
    }
});

const optionalIdDetailsSchema = z.object({
  type: z.string().optional(),
  number: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type && !data.number) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please enter an ID number.',
            path: ['number'],
        });
    }
    if (!data.type && data.number) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please select an ID type.',
            path: ['type'],
        });
    }
    if (data.type === 'aadhar' && data.number) {
        if (!/^\d{12}$/.test(data.number)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Aadhar number must be 12 digits.',
                path: ['number'],
            });
        }
    } else if (data.type === 'pan' && data.number) {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.number.toUpperCase())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid PAN number format.',
                path: ['number'],
            });
        }
    }
}).optional();


const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  fatherName: z.string().min(2, { message: "Father's name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits.' }),
  idDetails: idDetailsSchema,
  idDetails2: optionalIdDetailsSchema,
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  services: z.array(z.string()).min(1, { message: 'You have to select at least one service.' }),
  knowsDriving: z.boolean().default(false),
  hasVehicle: z.boolean().default(false),
  drivingLicenseNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

export default function EditWorkerPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params.id as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      fatherName: '',
      mobile: '',
      idDetails: { type: '', number: '' },
      idDetails2: { type: '', number: '' },
      address: '',
      services: [],
      knowsDriving: false,
      hasVehicle: false,
      drivingLicenseNumber: '',
      vehicleNumber: '',
    },
  });

  useEffect(() => {
    const fetchWorkerData = async () => {
        if (!workerId) return;
        setLoading(true);
        try {
            const workerDoc = await getDoc(doc(db, 'workers', workerId));
            if (workerDoc.exists()) {
                const workerData = workerDoc.data();
                form.reset({
                    name: workerData.displayName || '',
                    email: workerData.email || '',
                    fatherName: workerData.fatherName || '',
                    mobile: workerData.mobile || '',
                    idDetails: workerData.idDetails || { type: '', number: '' },
                    idDetails2: workerData.idDetails2 || { type: '', number: '' },
                    address: workerData.address || '',
                    services: workerData.services || [],
                    knowsDriving: workerData.knowsDriving || false,
                    hasVehicle: workerData.hasVehicle || false,
                    drivingLicenseNumber: workerData.drivingLicenseNumber || '',
                    vehicleNumber: workerData.vehicleNumber || '',
                });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Worker not found.' });
                router.push('/manager/workers');
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch worker data.' });
        } finally {
            setLoading(false);
        }
    }
    fetchWorkerData();
  }, [workerId, form, router, toast]);

  const knowsDriving = form.watch('knowsDriving');
  const hasVehicle = form.watch('hasVehicle');
  const idType1 = form.watch('idDetails.type');
  const idType2 = form.watch('idDetails2.type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await updateWorker(workerId, values);
      if (result.success) {
        toast({
          title: 'Worker Updated',
          description: `Worker ${values.name} has been updated.`,
        });
        router.push('/manager/workers');
      } else {
        throw new Error(result.error || 'An unknown error occurred');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Update Worker',
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Worker</CardTitle>
                <CardDescription>Loading worker data...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Worker</CardTitle>
        <CardDescription>Update the details for this worker.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Richard Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="worker@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="9876543210" {...field} maxLength={10}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-1 gap-6">
                 <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main St, Anytown, State, 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <FormField
                  control={form.control}
                  name="idDetails"
                  render={() => (
                    <FormItem>
                      <FormLabel>ID Details 1</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="idDetails.type"
                          render={({ field: typeField }) => (
                            <FormItem>
                                <FormLabel>ID Type</FormLabel>
                              <Select onValueChange={typeField.onChange} value={typeField.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="ID Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {idTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                               <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="idDetails.number"
                          render={({ field: numField }) => (
                            <FormItem>
                                <FormLabel>ID Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ID Number" 
                                    {...numField}
                                    type="text"
                                    maxLength={idType1 === 'pan' ? 10 : idType1 === 'aadhar' ? 12 : undefined}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (idType1 === 'pan') {
                                            numField.onChange(value.toUpperCase());
                                        } else if (idType1 === 'aadhar') {
                                            const numericValue = value.replace(/\D/g, '');
                                            if (numericValue.length <= 12) {
                                                numField.onChange(numericValue);
                                            }
                                        } else {
                                            numField.onChange(value);
                                        }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="idDetails2"
                  render={() => (
                    <FormItem>
                      <FormLabel>ID Details 2 (Optional)</FormLabel>
                       <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="idDetails2.type"
                          render={({ field: typeField }) => (
                            <FormItem>
                                <FormLabel>ID Type</FormLabel>
                              <Select onValueChange={typeField.onChange} value={typeField.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="ID Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {idTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                               <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="idDetails2.number"
                          render={({ field: numField }) => (
                            <FormItem>
                                <FormLabel>ID Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ID Number" 
                                    {...numField}
                                    value={numField.value || ''}
                                    type="text"
                                    maxLength={idType2 === 'pan' ? 10 : idType2 === 'aadhar' ? 12 : undefined}
                                     onChange={(e) => {
                                        let value = e.target.value;
                                        if (idType2 === 'pan') {
                                            numField.onChange(value.toUpperCase());
                                        } else if (idType2 === 'aadhar') {
                                            const numericValue = value.replace(/\D/g, '');
                                             if (numericValue.length <= 12) {
                                                numField.onChange(numericValue);
                                            }
                                        } else {
                                            numField.onChange(value);
                                        }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="knowsDriving"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Knows Driving</FormLabel>
                                <FormDescription>
                                    Does this worker have a driver's license?
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 {knowsDriving && (
                    <FormField
                        control={form.control}
                        name="drivingLicenseNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Driving License Number</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., DL1420110012345" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 )}
                 <FormField
                    control={form.control}
                    name="hasVehicle"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Has Own Vehicle</FormLabel>
                                <FormDescription>
                                    Can this worker use their own vehicle for jobs?
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {hasVehicle && (
                    <FormField
                        control={form.control}
                        name="vehicleNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vehicle Number</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., DL-12-AB-3456" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
            </div>


            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Assign Services</FormLabel>
                    <FormDescription>
                      Select the services this worker is qualified to perform.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {services.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="services"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          (field.value || [])?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.name}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
