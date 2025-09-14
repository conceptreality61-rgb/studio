
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { services, Service, ServiceSubCategory } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';

// Mock data, in a real app this would come from your backend
const workerProfile = {
  name: 'Lucas Hernandez',
  email: 'lucas@provider.com',
  phone: '(555) 987-6543',
  bio: 'Dedicated and experienced worker with a passion for creating clean and beautiful spaces. I take pride in my work and always strive for customer satisfaction.',
  verificationStatus: 'Approved', // or 'Pending', 'Rejected'
  idUrl: 'https://picsum.photos/seed/id-doc/600/400',
  certUrl: 'https://picsum.photos/seed/cert-doc/600/400',
  selectedServices: {
    'gardening': ['lawn-mowing', 'pruning'],
    'maid-service': ['dish-cleaning'],
  },
  availability: [new Date()],
};

type SelectedServices = Record<string, string[]>;

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<SelectedServices>(workerProfile.selectedServices);
  const [availability, setAvailability] = useState<Date[] | undefined>(workerProfile.availability);

  const handleServiceToggle = (serviceId: string, isChecked: boolean) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (isChecked) {
        if (!next[serviceId]) {
          next[serviceId] = [];
        }
      } else {
        delete next[serviceId];
      }
      return next;
    });
  };

  const handleSubServiceToggle = (serviceId: string, subServiceId: string, isChecked: boolean) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (!next[serviceId]) return prev;

      if (isChecked) {
        next[serviceId] = [...next[serviceId], subServiceId];
      } else {
        next[serviceId] = next[serviceId].filter(id => id !== subServiceId);
      }
      return next;
    });
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save changes would go here
    console.log({ selectedServices, availability });
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  const statusVariant = {
    Approved: 'default',
    Pending: 'secondary',
    Rejected: 'destructive',
  } as const;
  
  return (
    <Card>
      <form onSubmit={handleSaveChanges}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL ?? `https://i.pravatar.cc/128?u=${user?.uid}`} />
              <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{user?.displayName}</CardTitle>
              <CardDescription className="text-base">{user?.email}</CardDescription>
              <div className="mt-2 flex items-center gap-2">
                  <Badge variant={statusVariant[workerProfile.verificationStatus] || 'outline'}>
                      {workerProfile.verificationStatus}
                  </Badge>
                  {workerProfile.verificationStatus === 'Approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <h3 className="text-lg font-medium">Your Application</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>Select Services and Sub-Services</Label>
              <Accordion type="multiple" className="w-full">
                {services.map(service => (
                  <AccordionItem value={service.id} key={service.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <service.icon className="h-5 w-5" />
                        <span>{service.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 space-y-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                              id={`service-${service.id}`}
                              checked={!!selectedServices[service.id]}
                              onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                          />
                          <Label htmlFor={`service-${service.id}`} className="font-semibold">Enable this service</Label>
                        </div>
                        {service.subCategories?.map(subCat => (
                          <div key={subCat.id}>
                            <h4 className="font-semibold text-sm mb-2">{subCat.name}</h4>
                            {subCat.options.map(option => (
                              <div key={option.id} className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                  id={`sub-${service.id}-${option.id}`}
                                  disabled={!selectedServices[service.id]}
                                  checked={selectedServices[service.id]?.includes(option.id)}
                                  onCheckedChange={(checked) => handleSubServiceToggle(service.id, option.id, !!checked)}
                                />
                                <Label htmlFor={`sub-${service.id}-${option.id}`} className="font-normal">{option.name}</Label>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
             <div className="space-y-4">
              <Label>Set Your Availability</Label>
               <div className="flex justify-center rounded-md border">
                <Calendar
                    mode="multiple"
                    selected={availability}
                    onSelect={setAvailability}
                    disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
                />
               </div>
             </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="id-upload">Identification Document</Label>
                <div className="flex items-center gap-2">
                  <Input id="id-upload" type="file" className="flex-1" />
                   <Button variant="outline" size="icon" asChild><a href={workerProfile.idUrl} target="_blank"><Upload /></a></Button>
                </div>
                <p className="text-xs text-muted-foreground">Upload a clear photo of your ID (e.g., Driver's License).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-upload">Professional Certification (Optional)</Label>
                 <div className="flex items-center gap-2">
                    <Input id="cert-upload" type="file" className="flex-1" />
                    <Button variant="outline" size="icon" asChild><a href={workerProfile.certUrl} target="_blank"><Upload /></a></Button>
                 </div>
                <p className="text-xs text-muted-foreground">Upload any relevant professional certifications.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button type="submit">Update Profile</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
