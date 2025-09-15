
'use client';

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Review = {
    id: string;
    serviceName: string;
    createdAt: Timestamp;
    rating: number;
    comment: string;
};

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
            {halfStar && <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
            {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)}
        </div>
    );
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'reviews'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(userReviews);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch your reviews.' });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user, toast]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reviews</CardTitle>
        <CardDescription>A log of all the feedback you've provided.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : reviews.length > 0 ? (
            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{review.serviceName}</h3>
                                    <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            <p className="text-muted-foreground pt-1">{review.comment}</p>
                        </div>
                        {index < reviews.length - 1 && <Separator />}
                    </React.Fragment>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-12">
                <p>You haven't submitted any reviews yet.</p>
                <p className="text-sm">Complete a service to leave a review.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
