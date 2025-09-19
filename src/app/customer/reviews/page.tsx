
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
    serviceQuality: number;
    workerBehavior: number;
    appExperience: number;
    statusUpdateRating?: number;
    serviceCost?: number;
    comment: string;
    paidAmount?: number;
};

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
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
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        
        // Sort client-side
        userReviews.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        });

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
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
        ) : reviews.length > 0 ? (
            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{review.serviceName}</h3>
                                    <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                                    {review.paidAmount && <p className="text-xs text-muted-foreground">Paid: Rs. {review.paidAmount}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-sm mb-1">Overall</p>
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            {review.comment && <p className="text-muted-foreground italic pt-1">"{review.comment}"</p>}
                             <div className="text-sm space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">App Experience</p>
                                    {renderStars(review.appExperience)}
                                </div>
                                {review.statusUpdateRating && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-muted-foreground">Status Update Timeliness</p>
                                        {renderStars(review.statusUpdateRating)}
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">Worker Behavior</p>
                                    {renderStars(review.workerBehavior)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-muted-foreground">Service Quality</p>
                                    {renderStars(review.serviceQuality)}
                                </div>
                                {review.serviceCost && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-muted-foreground">Service Cost</p>
                                        {renderStars(review.serviceCost)}
                                    </div>
                                )}
                            </div>
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
