
'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
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
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Worker = {
    id: string;
    displayName: string;
    createdAt: Timestamp;
    rating: number;
    verificationStatus: 'Approved' | 'Pending' | 'Rejected';
    tasksCompleted: number;
    services?: string[];
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Approved: "default",
  Pending: "secondary",
  Rejected: "destructive",
};

export default function ManagerWorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'worker'));
                const querySnapshot = await getDocs(q);
                const workersData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        displayName: data.displayName || 'N/A',
                        createdAt: data.createdAt,
                        rating: data.rating || 0,
                        verificationStatus: data.verificationStatus || 'Pending',
                        tasksCompleted: data.tasksCompleted || 0,
                        services: data.services || [],
                    } as Worker;
                });
                setWorkers(workersData);
            } catch (error) {
                console.error("Error fetching workers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, []);

    const formatDate = (timestamp?: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString();
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Workers</CardTitle>
            <CardDescription>Manage your team of service providers.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/manager/workers/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Worker
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
                <TableHead>Join Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Completed Tasks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {workers.map((worker) => (
                <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.displayName}</TableCell>
                    <TableCell>{formatDate(worker.createdAt)}</TableCell>
                    <TableCell>{worker.rating.toFixed(1)}</TableCell>
                    <TableCell>{worker.tasksCompleted}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariant[worker.verificationStatus] || 'secondary'}>{worker.verificationStatus}</Badge>
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
                            {worker.verificationStatus === 'Pending' && (
                                <DropdownMenuItem asChild>
                                <Link href={`/manager/workers/verify/${worker.id}`}>Verify Application</Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Message</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
