
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

type StatusHistoryItem = {
  status: string;
  timestamp: Timestamp;
};

type Booking = {
  id: string;
  serviceName: string;
  estimatedCharge?: number;
  statusHistory?: StatusHistoryItem[];
  initialEstimate?: number; 
};

type BookingSummary = {
    id: string;
    serviceName: string;
    startDate: string | null;
    completionDate: string | null;
    finalCost: number;
    costDifference: number;
}

export default function ManagerAnalyticsPage() {
    const [summaries, setSummaries] = useState<BookingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCompletedBookings = async () => {
            try {
                const q = query(
                    collection(db, 'bookings'), 
                    where('status', '==', 'Completed'),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);

                const summariesData = querySnapshot.docs.map(doc => {
                    const data = doc.data() as Booking;

                    const findTimestamp = (status: string) => {
                        const entry = data.statusHistory?.find(h => h.status === status);
                        return entry ? entry.timestamp.toDate().toLocaleString() : null;
                    };

                    const startDate = findTimestamp('In Progress');
                    const completionDate = findTimestamp('Completed');

                    const initialEstimateEntry = data.statusHistory?.find(h => h.status === 'Pending Customer Approval');
                    const initialEstimate = initialEstimateEntry && 'estimate' in initialEstimateEntry ? (initialEstimateEntry as any).estimate : data.initialEstimate || data.estimatedCharge || 0;
                    
                    const finalCost = data.estimatedCharge || 0;
                    const costDifference = finalCost - initialEstimate;

                    return {
                        id: doc.id,
                        serviceName: data.serviceName,
                        startDate,
                        completionDate,
                        finalCost,
                        costDifference,
                    };
                });
                
                setSummaries(summariesData);

            } catch (error) {
                console.error("Error fetching analytics data:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch booking summaries."});
            } finally {
                setLoading(false);
            }
        };
        fetchCompletedBookings();
    }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
        <CardDescription>An overview of completed jobs, their timelines, and cost analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : summaries.length > 0 ? (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Job Start Date</TableHead>
                        <TableHead>Job Completion Date</TableHead>
                        <TableHead className="text-right">Final Paid Amount</TableHead>
                        <TableHead className="text-right">Cost Difference</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {summaries.map((summary) => (
                    <TableRow key={summary.id}>
                        <TableCell className="font-medium">{summary.id.substring(0,6)}</TableCell>
                        <TableCell>{summary.serviceName}</TableCell>
                        <TableCell>{summary.startDate || 'N/A'}</TableCell>
                        <TableCell>{summary.completionDate || 'N/A'}</TableCell>
                        <TableCell className="text-right">Rs. {summary.finalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                           <div className={`flex items-center justify-end gap-1 ${
                               summary.costDifference > 0 ? 'text-destructive' : 
                               summary.costDifference < 0 ? 'text-green-600' : 'text-muted-foreground'
                           }`}>
                               {summary.costDifference > 0 ? <ArrowUp size={14}/> : 
                                summary.costDifference < 0 ? <ArrowDown size={14}/> : <Minus size={14}/>}
                               Rs. {Math.abs(summary.costDifference).toFixed(2)}
                           </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        ) : (
             <div className="text-center text-muted-foreground py-12">
                <p>No completed bookings found to generate a summary.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
