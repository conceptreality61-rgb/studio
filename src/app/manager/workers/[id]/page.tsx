
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Phone, Home, Briefcase, Calendar, Car, ShieldCheck, BadgeCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { services as allServices } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateWorkerStatus } from './actions';
import { useToast } from '@/hooks/use-toast';


type Worker = {
    id: string;
    displayName: string;
    fatherName: string;
    email: string;
    mobile: string;
    address: string;
    services: string[];
    createdAt: Timestamp;
    knowsDriving: boolean;
    hasVehicle: boolean;
    drivingLicenseNumber?: string;
    vehicleNumber?: string;
    idDetails: { type: string; number: string };
    idDetails2?: { type: string; number: string };
    status: 'Active' | 'Inactive';
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-muted-foreground mt-1" />
        <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    </div>
);

export default function ManagerWorkerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const workerId = params.id as string;

  useEffect(() => {
    const fetchWorker = async () => {
      if (!workerId) return;
      try {
        const docRef = doc(db, 'workers', workerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWorker({ id: docSnap.id, ...docSnap.data() } as Worker);
        } else {
          console.log("No such document!");
          router.push('/manager/workers');
        }
      } catch (error) {
        console.error("Error fetching worker:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [workerId, router]);
  
  const handleStatusChange = async (newStatus: 'Active' | 'Inactive') => {
      if (!worker) return;
      setIsSavingStatus(true);

      const result = await updateWorkerStatus(worker.id, newStatus);
      if (result.success) {
          setWorker(prev => prev ? { ...prev, status: newStatus } : null);
          toast({
              title: "Status Updated",
              description: `${worker.displayName}'s status is now ${newStatus}.`,
          });
      } else {
          toast({
              variant: 'destructive',
              title: "Update Failed",
              description: result.error,
          });
      }
      setIsSavingStatus(false);
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const workerServices = allServices
    .filter(s => worker?.services.includes(s.id))
    .map(s => s.name);

  if (loading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-6">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              </CardContent>
          </Card>
      )
  }
  
  if (!worker) return <p>Worker not found.</p>;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-3xl">{worker.displayName}</CardTitle>
                        <CardDescription>Worker ID: {worker.id}</CardDescription>
                    </div>
                    <Button asChild className="mt-4 sm:mt-0">
                        <Link href={`/manager/workers/edit/${worker.id}`}>Edit Worker Profile</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailItem icon={User} label="Father's Name" value={worker.fatherName} />
                            <DetailItem icon={Mail} label="Email" value={worker.email} />
                            <DetailItem icon={Phone} label="Mobile" value={worker.mobile} />
                            <DetailItem icon={Home} label="Address" value={worker.address} />
                            <DetailItem icon={Calendar} label="Join Date" value={formatDate(worker.createdAt)} />
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Identification</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailItem icon={BadgeCheck} label={`ID 1 (${worker.idDetails.type})`} value={worker.idDetails.number} />
                            {worker.idDetails2 && worker.idDetails2.type && (
                                <DetailItem icon={BadgeCheck} label={`ID 2 (${worker.idDetails2.type})`} value={worker.idDetails2.number} />
                            )}
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Skills & Assets</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DetailItem icon={ShieldCheck} label="Knows Driving" value={worker.knowsDriving ? `Yes (${worker.drivingLicenseNumber || 'N/A'})` : 'No'} />
                            <DetailItem icon={Car} label="Has Vehicle" value={worker.hasVehicle ? `Yes (${worker.vehicleNumber || 'N/A'})` : 'No'} />
                            <div className="flex items-start gap-3 md:col-span-3">
                                <Briefcase className="w-5 h-5 text-muted-foreground mt-1" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Assigned Services</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {workerServices.length > 0 ? workerServices.map(service => (
                                            <Badge key={service} variant="secondary">{service}</Badge>
                                        )) : <span className="font-medium">No services assigned</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>Control whether this worker can be assigned to new jobs.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    {isSavingStatus && <Loader2 className="h-5 w-5 animate-spin" />}
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                        Job Status
                        </p>
                        <p className="text-sm text-muted-foreground">
                        {worker.status === 'Active' ? 'Worker can be assigned to new jobs.' : 'Worker cannot be assigned to new jobs.'}
                        </p>
                    </div>
                    <Switch
                        id="job-status"
                        checked={worker.status === 'Active'}
                        onCheckedChange={(checked) => handleStatusChange(checked ? 'Active' : 'Inactive')}
                        disabled={isSavingStatus}
                        aria-readonly={isSavingStatus}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">"Inactive" workers will not appear in the assignment list for new bookings.</p>
            </CardFooter>
        </Card>
    </div>
  );
}
