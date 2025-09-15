
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, Camera, Loader2 } from 'lucide-react';
import { services } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { type DateRange } from 'react-day-picker';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

type SelectedServices = Record<string, string[]>;
type UserProfile = {
    displayName?: string;
    verificationStatus?: 'Approved' | 'Pending' | 'Rejected';
    selectedServices?: SelectedServices;
    availability?: DateRange;
    idUrl?: string;
    certUrl?: string;
};

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});
  const [availability, setAvailability] = useState<DateRange | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            setSelectedServices(data.selectedServices || {});
            if (data.availability?.from && data.availability?.to) {
              setAvailability({
                from: (data.availability.from as any).toDate(),
                to: (data.availability.to as any).toDate(),
              });
            }
          }
        } catch (error) {
          console.error("Error fetching worker profile:", error);
          toast({ variant: 'destructive', title: "Error", description: "Could not load your profile data." });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


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

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const dataToSave: Partial<UserProfile> = {
            selectedServices,
            availability,
        };
        await setDoc(userRef, dataToSave, { merge: true });

        // In a real app, you'd handle file uploads to Firebase Storage here
        // and save the URLs in `idUrl` and `certUrl` fields.

        toast({
            title: 'Profile Updated',
            description: 'Your changes have been saved successfully.',
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'There was an error saving your profile.',
        });
    } finally {
        setSaving(false);
    }
  };

  const statusVariant = {
    Approved: 'default',
    Pending: 'secondary',
    Rejected: 'destructive',
  } as const;
  
  if (loading) {
      return (
          <Card>
              <CardHeader><Skeleton className="h-24 w-full" /></CardHeader>
              <CardContent><Skeleton className="h-64 w-full" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-32 ml-auto" /></CardFooter>
          </Card>
      )
  }

  return (
    <Card>
      <form onSubmit={handleSaveChanges}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview ?? user?.photoURL ?? `https://i.pravatar.cc/128?u=${user?.uid}`} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div>
              <CardTitle className="text-3xl">{user?.displayName}</CardTitle>
              <CardDescription className="text-base">{user?.email}</CardDescription>
              <div className="mt-2 flex items-center gap-2">
                  <Badge variant={statusVariant[profile?.verificationStatus || 'Pending'] || 'outline'}>
                      {profile?.verificationStatus || 'Pending'}
                  </Badge>
                  {profile?.verificationStatus === 'Approved' && <CheckCircle className="h-5 w-5 text-green-500" />}
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
                      <div className="pl-4 space-y-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                              id={`service-${service.id}`}
                              checked={!!selectedServices[service.id]}
                              onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                          />
                          <Label htmlFor={`service-${service.id}`} className="font-semibold">Enable this service</Label>
                        </div>
                        {service.subCategories?.map(subCat => (
                          <div key={subCat.id} className="pl-4">
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
                {isClient && (
                  <Calendar
                      mode="range"
                      selected={availability}
                      onSelect={setAvailability}
                      disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
                  />
                )}
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
                   {profile?.idUrl && <Button variant="outline" size="icon" asChild><a href={profile.idUrl} target="_blank"><Upload /></a></Button>}
                </div>
                <p className="text-xs text-muted-foreground">Upload a clear photo of your ID (e.g., Driver's License).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-upload">Professional Certification (Optional)</Label>
                 <div className="flex items-center gap-2">
                    <Input id="cert-upload" type="file" className="flex-1" />
                    {profile?.certUrl && <Button variant="outline" size="icon" asChild><a href={profile.certUrl} target="_blank"><Upload /></a></Button>}
                 </div>
                <p className="text-xs text-muted-foreground">Upload any relevant professional certifications.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin mr-2" />}
            {saving ? "Saving..." : "Update Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
