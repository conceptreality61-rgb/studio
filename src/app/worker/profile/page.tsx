
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, User, Mail, Phone, Home, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { services as allServices } from '@/lib/constants';

type WorkerProfile = {
    displayName: string;
    email: string;
    mobile: string;
    address: string;
    services: string[];
    photoURL?: string;
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-muted-foreground mt-1" />
        <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-medium">{value || 'Not set'}</span>
        </div>
    </div>
);


export default function WorkerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<WorkerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'workers', user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as WorkerProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({ variant: 'destructive', title: "Error", description: "Could not fetch your profile." });
        } finally {
          setLoading(false);
        }
      } else {
          setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const workerServices = allServices
    .filter(s => profile.services?.includes(s.id))
    .map(s => s.name);

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.photoURL ?? `https://i.pravatar.cc/128?u=${user?.uid}`} />
            <AvatarFallback>{profile?.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          <div>
            <CardTitle className="text-3xl">{profile.displayName}</CardTitle>
            <CardDescription className="text-base">{user?.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem icon={User} label="Full Name" value={profile.displayName} />
            <DetailItem icon={Mail} label="Email" value={profile.email} />
            <DetailItem icon={Phone} label="Mobile" value={profile.mobile} />
            <DetailItem icon={Home} label="Address" value={profile.address} />
        </div>
        <Separator />
        <h3 className="text-lg font-medium">Assigned Services</h3>
         <div className="flex flex-wrap gap-2 mt-1">
            {workerServices.length > 0 ? workerServices.map(service => (
                <Badge key={service} variant="secondary">{service}</Badge>
            )) : <span className="font-medium text-sm text-muted-foreground">No services assigned</span>}
        </div>
      </CardContent>
    </Card>
  );
}
