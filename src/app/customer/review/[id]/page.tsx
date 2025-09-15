
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export default function ReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bookingId = params.id as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a star rating.',
      });
      return;
    }

    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a review.' });
        return;
    }
    
    setIsSubmitting(true);
    try {
        await setDoc(doc(db, 'reviews', `${bookingId}_${user.uid}`), {
            bookingId,
            userId: user.uid,
            rating,
            comment,
            createdAt: serverTimestamp(),
            serviceName: 'Service', // In a real app, you'd fetch this from the booking
            userName: user.displayName
        });

        toast({
            title: 'Review Submitted!',
            description: 'Thank you for your feedback.',
        });

        router.push('/customer/reviews');

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

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
          <CardDescription>Share your experience for booking #{bookingId}. How did we do?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Your Rating</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Your Comments</Label>
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
