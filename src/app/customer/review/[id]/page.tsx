
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a star rating.',
      });
      return;
    }
    
    // In a real app, you'd submit this to your backend.
    console.log({
      bookingId: params.id,
      rating,
      comment,
    });

    toast({
      title: 'Review Submitted!',
      description: 'Thank you for your feedback.',
    });

    router.push('/customer/reviews');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
          <CardDescription>Share your experience for booking #{params.id}. How did we do?</CardDescription>
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
          <Button type="submit">Submit Review</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
