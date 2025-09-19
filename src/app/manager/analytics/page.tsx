
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
import { Separator } from '@/components/ui/separator';

type StatusHistoryItem = {
  status: string;
  timestamp: Timestamp;
};

type Booking = {
  id: string;
  serviceName: string;
  customerName: string;
  estimatedCharge?: number;
  statusHistory?: StatusHistoryItem[];
  initialEstimate?: number; 
  createdAt: Timestamp;
};

type Review = {
    id: string;
    bookingId: string;
    rating: number;
    comment: string;
    serviceName: string;
    userName: string;
    createdAt: Timestamp;
    appExperience: number;
    statusUpdateRating?: number;
    workerBehavior: number;
    serviceQuality: number;
    serviceCost?: number;
    paidAmount?: number;
};

type BookingSummary = {
    id: string;
    serviceName: string;
    customerName: string;
    startDate: string | null;
    completionDate: string | null;
    initialEstimate: number;
    finalCost: number;
    customerPaidAmount?: number;
    rating?: number;
    comment?: string;
}

type AverageRatings = {
    overall: number;
    appExperience: number;
    statusUpdate: number;
    workerBehavior: number;
    serviceQuality: number;
    serviceCost: number;
    count: number;
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

const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
}

export default function ManagerAnalyticsPage() {
    const [summaries, setSummaries] = useState<BookingSummary[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRatings, setAverageRatings] = useState<AverageRatings | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                // Fetch completed bookings
                const bookingsQuery = query(
                    collection(db, 'bookings'), 
                    where('status', '==', 'Completed')
                );
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const completedBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                
                // Fetch reviews
                const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviewsData = reviewsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Review));
                setReviews(reviewsData);
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
                    const review = reviewsMap.get(data.id);

                    return {
                        id: data.id,
                        serviceName: data.serviceName,
                        customerName: data.customerName,
                        startDate,
                        completionDate,
                        initialEstimate,
                        finalCost,
                        customerPaidAmount: review?.paidAmount,
                        rating: review?.rating,
                        comment: review?.comment,
                    };
                });
                
                setSummaries(summariesData);

                 // Calculate average ratings
                if (reviewsData.length > 0) {
                    const total = reviewsData.reduce((acc, review) => {
                        acc.overall += review.rating || 0;
                        acc.appExperience += review.appExperience || 0;
                        acc.statusUpdate += review.statusUpdateRating || 0;
                        acc.workerBehavior += review.workerBehavior || 0;
                        acc.serviceQuality += review.serviceQuality || 0;
                        acc.serviceCost += review.serviceCost || 0;
                        return acc;
                    }, { overall: 0, appExperience: 0, statusUpdate: 0, workerBehavior: 0, serviceQuality: 0, serviceCost: 0 });

                    const count = reviewsData.length;
                    const statusUpdateCount = reviewsData.filter(r => r.statusUpdateRating !== undefined).length;
                    const serviceCostCount = reviewsData.filter(r => r.serviceCost !== undefined).length;

                    setAverageRatings({
                        overall: total.overall / count,
                        appExperience: total.appExperience / count,
                        statusUpdate: statusUpdateCount > 0 ? total.statusUpdate / statusUpdateCount : 0,
                        workerBehavior: total.workerBehavior / count,
                        serviceQuality: total.serviceQuality / count,
                        serviceCost: serviceCostCount > 0 ? total.serviceCost / serviceCostCount : 0,
                        count: count
                    });
                }


            } catch (error) {
                console.error("Error fetching analytics data:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch booking summaries."});
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, [toast]);

  return (
    <div className='space-y-6'>
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
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Job Start Date</TableHead>
                                    <TableHead>Job Completion Date</TableHead>
                                    <TableHead className="text-right">Estimated Cost</TableHead>
                                    <TableHead className="text-right">Final Bill Amount</TableHead>
                                    <TableHead className="text-right">Customer Paid Amount</TableHead>
                                    <TableHead className="text-center">Comment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summaries.map((summary) => (
                                <TableRow key={summary.id}>
                                    <TableCell className="font-medium">{summary.id.substring(0,6)}</TableCell>
                                    <TableCell>{summary.customerName}</TableCell>
                                    <TableCell>{summary.serviceName}</TableCell>
                                    <TableCell>{summary.startDate || 'N/A'}</TableCell>
                                    <TableCell>{summary.completionDate || 'N/A'}</TableCell>
                                    <TableCell className="text-right">Rs. {summary.initialEstimate.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">Rs. {summary.finalCost.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        {summary.customerPaidAmount !== undefined ? `Rs. ${summary.customerPaidAmount.toFixed(2)}` : <span className="text-muted-foreground text-xs">N/A</span>}
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
        <Card>
            <CardHeader>
                <CardTitle>Customer Review Analysis</CardTitle>
                <CardDescription>A summary of customer feedback and ratings.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : reviews.length > 0 && averageRatings ? (
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
                             <div className='p-4 border rounded-lg'>
                                <p className='text-sm text-muted-foreground'>Overall Average Rating</p>
                                <div className='flex items-center justify-center gap-2 mt-1'>
                                    <p className='text-3xl font-bold'>{averageRatings.overall.toFixed(2)}</p>
                                    <Star className='h-7 w-7 text-yellow-400 fill-yellow-400'/>
                                </div>
                                <p className='text-xs text-muted-foreground'>from {averageRatings.count} reviews</p>
                             </div>
                             <div className='p-4 border rounded-lg col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4'>
                                <div className='text-sm'>
                                    <p className='text-muted-foreground'>App Experience</p>
                                    <div className='font-bold flex items-center justify-center gap-1'>{averageRatings.appExperience.toFixed(2)} {renderStars(averageRatings.appExperience)}</div>
                                </div>
                                <div className='text-sm'>
                                    <p className='text-muted-foreground'>Status Updates</p>
                                    <div className='font-bold flex items-center justify-center gap-1'>{averageRatings.statusUpdate.toFixed(2)} {renderStars(averageRatings.statusUpdate)}</div>
                                </div>
                                <div className='text-sm'>
                                    <p className='text-muted-foreground'>Worker Behavior</p>
                                    <div className='font-bold flex items-center justify-center gap-1'>{averageRatings.workerBehavior.toFixed(2)} {renderStars(averageRatings.workerBehavior)}</div>
                                </div>
                                 <div className='text-sm'>
                                    <p className='text-muted-foreground'>Service Quality</p>
                                    <div className='font-bold flex items-center justify-center gap-1'>{averageRatings.serviceQuality.toFixed(2)} {renderStars(averageRatings.serviceQuality)}</div>
                                </div>
                                 <div className='text-sm'>
                                    <p className='text-muted-foreground'>Service Cost</p>
                                    <div className='font-bold flex items-center justify-center gap-1'>{averageRatings.serviceCost.toFixed(2)} {renderStars(averageRatings.serviceCost)}</div>
                                </div>
                             </div>
                        </div>
                         <div>
                            <h4 className='font-semibold mb-2'>Recent Reviews</h4>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Rating</TableHead>
                                        <TableHead>Comment</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviews.slice(0, 5).map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>{review.serviceName}</TableCell>
                                            <TableCell>{review.userName}</TableCell>
                                            <TableCell>{formatDate(review.createdAt)}</TableCell>
                                            <TableCell className="text-right">{renderStars(review.rating)}</TableCell>
                                            <TableCell className="max-w-sm">
                                                <p className='truncate italic text-muted-foreground'>"{review.comment}"</p>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p>No customer reviews found yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
