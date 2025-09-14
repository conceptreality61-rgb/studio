'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle } from 'lucide-react';

// Mock data, in a real app this would come from your backend
const workerProfile = {
  name: 'Lucas Hernandez',
  email: 'lucas@provider.com',
  phone: '(555) 987-6543',
  skills: ['Gardening', 'Maid Service'],
  bio: 'Dedicated and experienced worker with a passion for creating clean and beautiful spaces. I take pride in my work and always strive for customer satisfaction.',
  verificationStatus: 'Approved', // or 'Pending', 'Rejected'
  idUrl: 'https://picsum.photos/seed/id-doc/600/400',
  certUrl: 'https://picsum.photos/seed/cert-doc/600/400',
};

export default function WorkerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save changes
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
      <CardContent>
        <form onSubmit={handleSaveChanges} className="space-y-6">
          <Separator />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user?.displayName ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user?.email ?? ''} readOnly />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue={workerProfile.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" defaultValue={workerProfile.skills.join(', ')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">About Me</Label>
            <textarea
              id="bio"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={workerProfile.bio}
            />
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
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
