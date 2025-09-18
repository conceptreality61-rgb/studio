
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, Timestamp, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { services } from '@/lib/constants';

type Worker = {
    id: string;
    displayName: string;
    email: string;
    createdAt: Timestamp;
    services: string[];
};

export default function ManagerWorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

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
                        createdAt: data.createdAt,
                        services: data.services || [],
                    } as Worker;
                });
                setWorkers(workersData);
            } catch (error) {
                console.error("Error fetching workers:", error);
                toast({ variant: 'destructive', title: "Error", description: "Could not fetch workers."});
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [toast]);

    const formatDate = (timestamp?: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString();
    }

    const getServiceNames = (serviceIds: string[]) => {
        if (!serviceIds) return 'N/A';
        return serviceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ');
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Workers</CardTitle>
            <CardDescription>Manage your team of service professionals.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/manager/workers/new">
                <PlusCircle className="mr-2" />
                Add Worker
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Worker Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Services</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {workers.map((worker) => (
                <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.displayName}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{getServiceNames(worker.services)}</TableCell>
                    <TableCell>{formatDate(worker.createdAt)}</TableCell>
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
                                <DropdownMenuItem>Edit Worker</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete Worker</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
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
