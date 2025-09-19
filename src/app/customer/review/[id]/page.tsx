
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-8 w-8 cursor-pointer transition-colors',
            (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

type BookingInfo = {
    serviceName: string;
    estimatedCharge?: number;
};


export default function ReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [appExperience, setAppExperience] = useState(0);
  const [statusUpdateRating, setStatusUpdateRating] = useState(0);
  const [workerBehavior, setWorkerBehavior] = useState(0);
  const [serviceQuality, setServiceQuality] = useState(0);
  const [serviceCost, setServiceCost] = useState(0);
  const [comment, setComment] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bookingId = params.id as string;

  useEffect(() => {
    if (!bookingId) return;

    const fetchBookingInfo = async () => {
        try {
            const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
            if (bookingDoc.exists()) {
                const data = bookingDoc.data();
                setBookingInfo({
                    serviceName: data.serviceName,
                    estimatedCharge: data.estimatedCharge
                });
                setPaidAmount(data.estimatedCharge || '');
            }
        } catch (error) {
            console.error("Failed to fetch booking details for review page:", error);
        } finally {
            setLoading(false);
        }
    }

    fetchBookingInfo();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceQuality === 0 || workerBehavior === 0 || appExperience === 0 || statusUpdateRating === 0 || serviceCost === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a rating for all categories.',
      });
      return;
    }

    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a review.' });
        return;
    }
    
    setIsSubmitting(true);
    try {
        const overallRating = (appExperience + statusUpdateRating + workerBehavior + serviceQuality + serviceCost) / 5;
        const finalPaidAmount = typeof paidAmount === 'string' ? parseFloat(paidAmount) : paidAmount;

        await setDoc(doc(db, 'reviews', `${bookingId}_${user.uid}`), {
            bookingId,
            userId: user.uid,
            rating: parseFloat(overallRating.toFixed(2)),
            appExperience: appExperience,
            statusUpdateRating: statusUpdateRating,
            workerBehavior: workerBehavior,
            serviceQuality: serviceQuality,
            serviceCost: serviceCost,
            comment,
            createdAt: serverTimestamp(),
            serviceName: bookingInfo?.serviceName || 'Service',
            userName: user.displayName,
            paidAmount: isNaN(finalPaidAmount) ? 0 : finalPaidAmount
        });

        toast({
            title: 'Review Submitted!',
            description: 'Thank you for your valuable feedback!',
        });

        router.push('/customer/review/thank-you');

    } catch (error) {
        console.error('Error submitting review', error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your review. Please try again.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
      return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
          <CardDescription>
            Share your experience for booking #{bookingId.substring(0,6)}. Feel free to share your valuable feedback for service improvement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
             <div className='p-4 border rounded-md'>
              <h3 className='font-semibold mb-3'>App & Booking Experience</h3>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                    <Label>Ease of using the app and booking process</Label>
                    <StarRating rating={appExperience} setRating={setAppExperience} />
                </div>
                <div className='flex justify-between items-center'>
                    <Label>Timeliness of service status update messages</Label>
                    <StarRating rating={statusUpdateRating} setRating={setStatusUpdateRating} />
                </div>
              </div>
            </div>
            <div className='p-4 border rounded-md'>
              <h3 className='font-semibold mb-3'>Worker Feedback</h3>
              <div className='flex justify-between items-center'>
                <Label>Worker's professionalism and behavior</Label>
                <StarRating rating={workerBehavior} setRating={setWorkerBehavior} />
              </div>
            </div>
            <div className='p-4 border rounded-md'>
              <h3 className='font-semibold mb-3'>Service Feedback</h3>
              <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <Label>Quality of the service provided</Label>
                    <StarRating rating={serviceQuality} setRating={setServiceQuality} />
                  </div>
                  <div className='flex justify-between items-center'>
                    <Label>Value for money (Service Cost)</Label>
                    <StarRating rating={serviceCost} setRating={setServiceCost} />
                  </div>
                    <div className='flex justify-between items-center'>
                       <Label htmlFor="paid-amount">Final amount paid</Label>
                       <div className="flex items-center gap-2">
                         <span className="font-bold">Rs.</span>
                         <Input 
                            id="paid-amount"
                            type="number"
                            className="w-28 font-bold"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder="0.00"
                          />
                       </div>
                   </div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
