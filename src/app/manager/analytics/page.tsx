
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Minus, Star, MessageSquare } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';

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
  createdAt: Timestamp;
};

type Review = {
    bookingId: string;
    rating: number;
    comment: string;
};

type BookingSummary = {
    id: string;
    serviceName: string;
    startDate: string | null;
    completionDate: string | null;
    initialEstimate: number;
    finalCost: number;
    costDifference: number;
    rating?: number;
    comment?: string;
}

const renderStars = (rating?: number) => {
    if (rating === undefined) return <span className="text-muted-foreground">N/A</span>;
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)}
        </div>
    );
};

export default function ManagerAnalyticsPage() {
    const [summaries, setSummaries] = useState<BookingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCompletedBookings = async () => {
            try {
                // Fetch completed bookings
                const bookingsQuery = query(
                    collection(db, 'bookings'), 
                    where('status', '==', 'Completed')
                );
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const completedBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                
                // Fetch reviews
                const reviewsQuery = query(collection(db, 'reviews'));
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviewsData = reviewsSnapshot.docs.map(doc => doc.data() as Review);
                const reviewsMap = new Map<string, Review>();
                reviewsData.forEach(review => {
                    reviewsMap.set(review.bookingId, review);
                });


                // Sort client-side
                completedBookings.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());


                const summariesData: BookingSummary[] = completedBookings.map(data => {
                    const findTimestamp = (status: string) => {
                        const entry = data.statusHistory?.find(h => h.status === status);
                        return entry ? entry.timestamp.toDate().toLocaleString() : null;
                    };

                    const startDate = findTimestamp('In Progress');
                    const completionDate = findTimestamp('Completed');

                    const initialEstimateEntry = data.statusHistory?.find(h => h.status === 'Pending Customer Approval');
                    const initialEstimate = initialEstimateEntry && 'estimate' in initialEstimateEntry ? (initialEstimateEntry as any).estimate : data.initialEstimate || 0;
                    
                    const finalCost = data.estimatedCharge || 0;
                    const costDifference = finalCost - initialEstimate;
                    const review = reviewsMap.get(data.id);

                    return {
                        id: data.id,
                        serviceName: data.serviceName,
                        startDate,
                        completionDate,
                        initialEstimate,
                        finalCost,
                        costDifference,
                        rating: review?.rating,
                        comment: review?.comment,
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
        <TooltipProvider>
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
                            <TableHead className="text-right">Estimated Cost</TableHead>
                            <TableHead className="text-right">Final Paid Amount</TableHead>
                            <TableHead className="text-right">Cost Difference</TableHead>
                            <TableHead className="text-right">Rating</TableHead>
                            <TableHead className="text-center">Comment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summaries.map((summary) => (
                        <TableRow key={summary.id}>
                            <TableCell className="font-medium">{summary.id.substring(0,6)}</TableCell>
                            <TableCell>{summary.serviceName}</TableCell>
                            <TableCell>{summary.startDate || 'N/A'}</TableCell>
                            <TableCell>{summary.completionDate || 'N/A'}</TableCell>
                            <TableCell className="text-right">Rs. {summary.initialEstimate.toFixed(2)}</TableCell>
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
                            <TableCell className="text-right">
                                {renderStars(summary.rating)}
                            </TableCell>
                            <TableCell className="text-center">
                                {summary.comment ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">{summary.comment}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <span className="text-muted-foreground text-xs">N/A</span>
                                )}
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
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
