
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Task = {
  id: string;
  serviceName: string;
  customerName: string;
  date: Timestamp;
  status: 'Completed' | 'In Progress' | 'Worker Assigned' | 'Pending Manager Approval' | 'Canceled';
};

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Completed: "default",
  "In Progress": "secondary",
  "Worker Assigned": "outline",
  "Pending Manager Approval": "outline",
  Canceled: 'destructive',
};

export default function AllTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'bookings'),
          where('workerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const workerTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(workerTasks.sort((a, b) => (b as any).createdAt.toMillis() - (a as any).createdAt.toMillis()));
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);
  
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All My Tasks</CardTitle>
        <CardDescription>A complete list of all your assigned jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : tasks.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.map((task) => (
                <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.id.substring(0, 6)}</TableCell>
                    <TableCell>{task.serviceName}</TableCell>
                    <TableCell>{task.customerName}</TableCell>
                    <TableCell>{formatDate(task.date)}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariant[task.status] || 'default'}>{task.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                        <Link href={`/worker/tasks/${task.id}`}><ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <p className="text-center text-muted-foreground py-10">You have not been assigned any tasks yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
