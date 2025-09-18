
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Car, Check, X, ShieldCheck, User as UserIcon, Search } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, Timestamp, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { services } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type Worker = {
    id: string;
    displayName: string;
    email: string;
    mobile: string;
    createdAt: Timestamp;
    services: string[];
    knowsDriving: boolean;
    hasVehicle: boolean;
    drivingLicenseNumber?: string;
    vehicleNumber?: string;
    status: 'Active' | 'Inactive';
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Active: "default",
  Inactive: "secondary",
};


export default function ManagerWorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [workersByService, setWorkersByService] = useState<Record<string, Worker[]>>({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const q = query(collection(db, 'workers'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const workersData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        displayName: data.displayName || 'N/A',
                        email: data.email || 'N/A',
                        mobile: data.mobile || 'N/A',
                        createdAt: data.createdAt,
                        services: data.services || [],
                        knowsDriving: data.knowsDriving || false,
                        hasVehicle: data.hasVehicle || false,
                        drivingLicenseNumber: data.drivingLicenseNumber,
                        vehicleNumber: data.vehicleNumber,
                        status: data.status || 'Inactive',
                    } as Worker;
                });
                
                workersData.sort((a, b) => {
                    if (a.status === 'Active' && b.status !== 'Active') {
                        return -1;
                    }
                    if (a.status !== 'Active' && b.status === 'Active') {
                        return 1;
                    }
                    // If statuses are the same, keep original sort order (newest first)
                    return 0;
                });

                setWorkers(workersData);

            } catch (error) {
                console.error("Error fetching workers:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch workers."});
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [toast]);

    useEffect(() => {
        const filteredWorkers = workers.filter(worker =>
            worker.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const groupedWorkers: Record<string, Worker[]> = {};
        services.forEach(service => {
            groupedWorkers[service.id] = filteredWorkers.filter(worker => worker.services.includes(service.id));
        });
        setWorkersByService(groupedWorkers);
    }, [workers, searchTerm]);

    const formatDate = (timestamp?: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString();
    }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div>
            <CardTitle>Workers</CardTitle>
            <CardDescription>Manage your team of service professionals, categorized by service.</CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by worker name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
                <Link href="/manager/workers/new">
                    <PlusCircle className="mr-2" />
                    Add Worker
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : (
            <Accordion type="multiple" defaultValue={services.map(s => s.id)} className="w-full">
                {services.map((service) => (
                    <AccordionItem value={service.id} key={service.id}>
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            <div className="flex items-center gap-2">
                                <service.icon className="w-5 h-5 text-primary" />
                                {service.name} ({workersByService[service.id]?.length || 0})
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             {workersByService[service.id]?.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead><b>Sl No.</b></TableHead>
                                            <TableHead><b>Worker Name</b></TableHead>
                                            <TableHead><b>WORKER ID</b></TableHead>
                                            <TableHead><b>Mobile Number</b></TableHead>
                                            <TableHead><b>Join Date</b></TableHead>
                                            <TableHead><b>Status</b></TableHead>
                                            <TableHead><b>Driving License</b></TableHead>
                                            <TableHead><b>Vehicle No.</b></TableHead>
                                            <TableHead>
                                                <span className="sr-only">Actions</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {workersByService[service.id].map((worker, index) => (
                                        <TableRow key={worker.id} className={cn(worker.status === 'Active' && 'bg-green-100 hover:bg-green-100/80')}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{worker.displayName}</TableCell>
                                            <TableCell>{worker.id}</TableCell>
                                            <TableCell>{worker.mobile}</TableCell>
                                            <TableCell>{formatDate(worker.createdAt)}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant[worker.status] || 'default'}>{worker.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {worker.knowsDriving ? <span className='flex items-center gap-1'><ShieldCheck className="text-green-500 w-4 h-4"/> Yes</span> : <span className='flex items-center gap-1'><X className="text-destructive w-4 h-4"/> No</span>}
                                                {worker.drivingLicenseNumber && <div className='text-xs text-muted-foreground'>({worker.drivingLicenseNumber})</div>}
                                            </TableCell>
                                            <TableCell>
                                                {worker.hasVehicle ? <span className='flex items-center gap-1'><Car className="text-green-500 w-4 h-4"/> Yes</span> : <span className='flex items-center gap-1'><X className="text-destructive w-4 h-4"/> No</span>}
                                                {worker.vehicleNumber && <div className='text-xs text-muted-foreground'>({worker.vehicleNumber})</div>}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manager/workers/${worker.id}`}>View Profile</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manager/workers/edit/${worker.id}`}>Edit Worker</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             ) : (
                                <p className="px-4 py-2 text-muted-foreground">No workers assigned to this service match your search.</p>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        )}
      </CardContent>
      {workers.length === 0 && !loading && (
        <CardFooter className="justify-center border-t pt-6">
            <p className="text-muted-foreground">No workers found. Add your first worker to get started.</p>
        </CardFooter>
      )}
    </Card>
  );
}
