
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Download, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type WorkerApplication = {
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Timestamp;
  selectedServices?: Record<string, string[]>;
  bio?: string;
  idUrl?: string;
  certUrl?: string;
};

export default function VerifyWorkerPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [application, setApplication] = useState<WorkerApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
    const workerId = params.id as string;

    useEffect(() => {
        const fetchApplication = async () => {
            if (!workerId) return;
            try {
                const docRef = doc(db, 'users', workerId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setApplication(docSnap.data() as WorkerApplication);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Worker application not found.' });
                }
            } catch (error) {
                console.error("Error fetching application:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch worker application.' });
            } finally {
                setLoading(false);
            }
        };
        fetchApplication();
    }, [workerId, toast]);
    
    const handleUpdateStatus = async (status: 'Approved' | 'Rejected') => {
        setActionLoading(status === 'Approved' ? 'approve' : 'reject');
        try {
            const workerRef = doc(db, 'users', workerId);
            await updateDoc(workerRef, { verificationStatus: status });
            toast({ title: `Worker ${status}`, description: `The worker's application has been ${status.toLowerCase()}.`});
            router.push('/manager/workers');
        } catch (error) {
            console.error(`Error ${status.toLowerCase()}ing worker:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Failed to ${status.toLowerCase()} the worker.` });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Skeleton className="h-10" /> <Skeleton className="h-10" /> <Skeleton className="h-10" />
                    </div>
                    <Skeleton className="h-20" />
                    <Separator />
                    <Skeleton className="h-20" />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        )
    }

    if (!application) {
        return <p>Worker application not found.</p>
    }

    const appliedServices = application.selectedServices ? Object.keys(application.selectedServices) : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verify Worker Application</CardTitle>
                <CardDescription>Review the details and documents for worker #{workerId.substring(0, 6)}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-lg font-semibold">{application.displayName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-lg font-semibold">{application.email}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-lg font-semibold">{application.phone || 'N/A'}</p>
                    </div>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-lg font-semibold">{application.address || 'N/A'}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-muted-foreground">{application.bio || 'No bio provided.'}</p>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h4 className="font-semibold">Applied Services</h4>
                    <div className="flex flex-wrap gap-2">
                        {appliedServices.length > 0 ? appliedServices.map(service => (
                            <Badge key={service} variant="secondary">{service.replace('-', ' ')}</Badge>
                        )) : <p className="text-sm text-muted-foreground">No services selected.</p>}
                    </div>
                </div>
                <Separator />
                 <div className="space-y-4">
                    <h4 className="font-semibold">Submitted Documents</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className='space-y-2'>
                           <p className='font-medium'>Identification Document</p>
                           {application.idUrl ? (
                            <>
                                <a href={application.idUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-lg overflow-hidden border">
                                    <Image src={application.idUrl} alt="ID Document" layout="fill" objectFit="cover" />
                                </a>
                                <Button variant="outline" size="sm" asChild><a href={application.idUrl} download><Download className="mr-2" />Download</a></Button>
                            </>
                           ) : <p className="text-sm text-muted-foreground">Not uploaded.</p>}
                        </div>
                         <div className='space-y-2'>
                           <p className='font-medium'>Professional Certification</p>
                           {application.certUrl ? (
                            <>
                                <a href={application.certUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-lg overflow-hidden border">
                                    <Image src={application.certUrl} alt="Certificate" layout="fill" objectFit="cover" />
                                </a>
                                <Button variant="outline" size="sm" asChild><a href={application.certUrl} download><Download className="mr-2" />Download</a></Button>
                            </>
                           ) : <p className="text-sm text-muted-foreground">Not uploaded.</p>}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleUpdateStatus('Rejected')} disabled={!!actionLoading}>
                    {actionLoading === 'reject' ? <Loader2 className="mr-2 animate-spin"/> : <X className="mr-2"/>}
                    Reject
                </Button>
                <Button onClick={() => handleUpdateStatus('Approved')} disabled={!!actionLoading}>
                    {actionLoading === 'approve' ? <Loader2 className="mr-2 animate-spin"/> : <Check className="mr-2"/>}
                    Approve
                </Button>
            </CardFooter>
        </Card>
    )
}
