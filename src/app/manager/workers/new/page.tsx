
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
import { createWorker } from './actions';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Loader2, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const idTypes = [
    { id: 'aadhar', name: 'Aadhar Card' },
    { id: 'pan', name: 'PAN Card' },
    { id: 'dl', name: 'Driving License' },
    { id: 'voterid', name: 'Voter ID' },
    { id: 'other', name: 'Other' },
]

const idDetailsSchema = z.object({
  type: z.string().optional(),
  number: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.type && !data.number) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please enter an ID number if type is selected.',
            path: ['number'],
        });
    }
    if (!data.type && data.number) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Please select an ID type if number is entered.',
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
  workerId: z.string().min(3, { message: 'Worker ID must be at least 3 characters.'}),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  fatherName: z.string().min(2, { message: "Father's name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: 'Mobile number must be 10 digits.' }),
  idDetails: idDetailsSchema,
  idDetails2: idDetailsSchema,
  address: z.string().min(10, { message: 'Address must be at least 10 characters.' }),
  services: z.array(z.string()).min(1, { message: 'You have to select at least one service.' }),
  knowsDriving: z.boolean().default(false),
  hasVehicle: z.boolean().default(false),
  drivingLicenseNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

export default function NewWorkerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: '',
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        // In a real app, you would upload this file to storage.
      };
      reader.readAsDataURL(file);
    }
  };

  const knowsDriving = form.watch('knowsDriving');
  const hasVehicle = form.watch('hasVehicle');
  const idType1 = form.watch('idDetails.type');
  const idType2 = form.watch('idDetails2.type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createWorker(values);
      if (result.success) {
        toast({
          title: 'Worker Created',
          description: `Worker ${values.name} has been added to your team.`,
        });
        router.push('/manager/workers');
      } else {
        throw new Error(result.error || 'An unknown error occurred');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Create Worker',
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Worker</CardTitle>
        <CardDescription>Add a new worker to your team and assign their services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview ?? `https://i.pravatar.cc/128?u=${form.getValues('workerId') || 'new'}`} />
                        <AvatarFallback>{form.getValues('name')?.charAt(0).toUpperCase() || 'W'}</AvatarFallback>
                    </Avatar>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Camera className="h-8 w-8 text-white" />
                    </button>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
                 <div className="grid flex-1 gap-6">
                    <FormField
                        control={form.control}
                        name="workerId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Worker ID</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., WRK001" {...field} />
                            </FormControl>
                            <FormDescription>Assign a unique ID for this worker.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
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
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                      <FormLabel className="text-base font-semibold">ID Document 1</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                        <FormField
                          control={form.control}
                          name="idDetails.type"
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
                          name="idDetails.number"
                          render={({ field: numField }) => (
                            <FormItem>
                                <FormLabel>ID Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ID Number" 
                                    {...numField}
                                    value={numField.value || ''}
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
                        <FormItem>
                            <FormLabel>Upload Document</FormLabel>
                             <FormControl>
                                <Input type="file" />
                            </FormControl>
                            <FormDescription>Upload a scan of the ID document.</FormDescription>
                        </FormItem>
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="idDetails2"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">ID Document 2 (Optional)</FormLabel>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
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
                        <FormItem>
                            <FormLabel>Upload Document</FormLabel>
                             <FormControl>
                                <Input type="file" />
                            </FormControl>
                            <FormDescription>Upload a scan of the ID document.</FormDescription>
                        </FormItem>
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
                            <Input placeholder="e.g., DL1420110012345" {...field} value={field.value || ''} />
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
                            <Input placeholder="e.g., DL-12-AB-3456" {...field} value={field.value || ''} />
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
              {isSubmitting ? 'Creating Worker...' : 'Create Worker'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    