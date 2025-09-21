
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Minus, Star, MessageSquare, PlusCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { featureReview } from './actions';

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
    userId: string;
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
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isFeaturing, setIsFeaturing] = useState<string | null>(null);

    const handleFeatureReview = async (review: Review) => {
        setIsFeaturing(review.id);
        const result = await featureReview({
            rating: review.rating,
            comment: review.comment,
            userName: review.userName,
            userId: review.userId,
            bookingId: review.bookingId,
        });

        if (result.success) {
            toast({ title: "Review Featured!", description: "This review will now appear on the homepage." });
        } else {
            toast({ variant: 'destructive', title: "Failed to Feature", description: result.error });
        }
        setIsFeaturing(null);
    };

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


                const summariesData: BookingSummary[] = completedBookings.map(booking => {
                    const findTimestamp = (status: string) => {
                        const entry = booking.statusHistory?.find(h => h.status === status);
                        return entry ? entry.timestamp.toDate().toLocaleString() : null;
                    };

                    const startDate = findTimestamp('In Progress');
                    const completionDate = findTimestamp('Completed');
                    const review = reviewsMap.get(booking.id);

                    return {
                        id: booking.id,
                        serviceName: booking.serviceName,
                        customerName: booking.customerName,
                        startDate,
                        completionDate,
                        initialEstimate: booking.initialEstimate || 0,
                        finalCost: booking.estimatedCharge || 0,
                        customerPaidAmount: review?.paidAmount,
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
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reviews.slice(0, 5).map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>{review.serviceName}</TableCell>
                                            <TableCell>{review.userName}</TableCell>
                                            <TableCell>{formatDate(review.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" onClick={() => setSelectedReview(review)}>
                                                            {renderStars(review.rating)}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                </AlertDialog>
                                            </TableCell>
                                            <TableCell className="max-w-sm">
                                                <p className='truncate italic text-muted-foreground'>"{review.comment}"</p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFeatureReview(review)}
                                                    disabled={isFeaturing === review.id}
                                                >
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    {isFeaturing === review.id ? 'Featuring...' : 'Feature'}
                                                </Button>
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
        
        {selectedReview && (
            <AlertDialog open={!!selectedReview} onOpenChange={(isOpen) => !isOpen && setSelectedReview(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Review for {selectedReview.serviceName}</AlertDialogTitle>
                        <AlertDialogDescription>
                            From {selectedReview.userName} on {formatDate(selectedReview.createdAt)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Overall Rating</p>
                            {renderStars(selectedReview.rating)}
                        </div>
                        <Separator />
                        <p className="italic text-muted-foreground">"{selectedReview.comment || 'No comment provided.'}"</p>
                        <Separator />
                        <div className="text-sm space-y-2 pt-2">
                            <h4 className="font-semibold mb-2">Rating Breakdown</h4>
                             <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">App Experience</p>
                                {renderStars(selectedReview.appExperience)}
                            </div>
                            {selectedReview.statusUpdateRating && (
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">Status Update Timeliness</p>
                                    {renderStars(selectedReview.statusUpdateRating)}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">Worker Behavior</p>
                                {renderStars(selectedReview.workerBehavior)}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">Service Quality</p>
                                {renderStars(selectedReview.serviceQuality)}
                            </div>
                            {selectedReview.serviceCost && (
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">Service Cost</p>
                                    {renderStars(selectedReview.serviceCost)}
                                </div>
                            )}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
         <Card>
            <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>An overview of completed job costs and customer payments.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-40 w-full" />
                ) : summaries.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Completed On</TableHead>
                                <TableHead className="text-right">Estimate</TableHead>
                                <TableHead className="text-right">Final Cost</TableHead>
                                <TableHead className="text-right">Customer Paid</TableHead>
                                <TableHead className="text-right">Variance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summaries.map(summary => {
                                const variance =
                                    typeof summary.customerPaidAmount === 'number'
                                    ? summary.customerPaidAmount - summary.finalCost
                                    : null;
                                return (
                                    <TableRow key={summary.id}>
                                        <TableCell>{summary.serviceName}</TableCell>
                                        <TableCell>{summary.customerName}</TableCell>
                                        <TableCell>{summary.completionDate}</TableCell>
                                        <TableCell className="text-right">Rs. {summary.initialEstimate.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">Rs. {summary.finalCost.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {typeof summary.customerPaidAmount === 'number' ? `Rs. ${summary.customerPaidAmount.toFixed(2)}` : <span className="text-muted-foreground text-xs">N/A</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {variance !== null ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className={`flex items-center justify-end gap-1 font-medium ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-destructive' : ''}`}>
                                                                {variance > 0 ? <ArrowUp size={14}/> : variance < 0 ? <ArrowDown size={14}/> : <Minus size={14}/>}
                                                                Rs. {Math.abs(variance).toFixed(2)}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{variance > 0 ? 'Overpaid' : variance < 0 ? 'Underpaid' : 'Paid in full'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center text-muted-foreground py-12">
                        <p>No completed bookings found yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}