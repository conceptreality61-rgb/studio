
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createWorker } from './actions';
import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { services } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  fatherName: z.string().min(2, { message: "Father's name must be at least 2 characters." }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Mobile must be a 10-digit number." }),
  idNumber: z.string().min(5, { message: "ID number must be at least 5 characters." }),
  workerGroup: z.string({ required_error: "Please select a worker group." }),
  services: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one service.",
  }),
  // Note: File inputs are not part of the Zod schema for client-side validation
  // as their handling is more complex (upload, etc.). We'll handle them separately.
});

export default function NewWorkerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      fatherName: "",
      mobile: "",
      idNumber: "",
      services: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // In a real application, you would handle file uploads here.
      // For example, upload to Firebase Storage and get the URLs.
      // const photoUrl = await uploadFile(photo);
      // const aadharUrl = await uploadFile(aadhar);
      // const voterIdUrl = await uploadFile(voterId);

      const result = await createWorker({
        ...values,
        // photoUrl, aadharUrl, voterIdUrl
      });

      if (result.success) {
        toast({
          title: "Worker Created",
          description: `The profile for ${values.displayName} has been created.`,
        });
        router.push('/manager/workers');
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Creation Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Worker Profile</CardTitle>
        <CardDescription>
          Manually enter the details for a new service provider. This will not create a login account.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-medium">Personal Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="displayName"
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
                        <Input placeholder="Robert Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="10-digit number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Number</FormLabel>
                      <FormControl>
                        <Input placeholder="12-digit Aadhar number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <Separator />

            <h3 className="text-lg font-medium">Assign Group & Services</h3>
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="workerGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a primary group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                     <FormLabel>Allowed Services</FormLabel>
                     <FormDescription>
                        Select all the services this worker is qualified to perform.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Upload Documents</h3>
                <FormDescription>Upload a clear photo and scans of the worker's identification documents.</FormDescription>
                <div className="grid md:grid-cols-3 gap-6 pt-2">
                    <FormItem>
                        <FormLabel>Worker's Photo</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <FormItem>
                        <FormLabel>Aadhar Card</FormLabel>
                        <FormControl>
                             <Input type="file" accept="image/*,application/pdf" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    <FormItem>
                        <FormLabel>Voter ID</FormLabel>
                        <FormControl>
                             <Input type="file" accept="image/*,application/pdf" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Worker Profile'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
