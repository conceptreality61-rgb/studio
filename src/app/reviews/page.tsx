
'use client';

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Review = {
    id: string;
    serviceName: string;
    createdAt: Timestamp;
    rating: number;
    comment: string;
    userName: string;
    userId: string;
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

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const allReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        
        setReviews(allReviews);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch reviews.' });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [toast]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
  }

  return (
    <div className="bg-secondary">
        <div className="container py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline">Customer Reviews</h1>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    See what our customers have to say about their experience with CleanSweep.
                </p>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                       <Card key={review.id}>
                           <CardContent className="pt-6">
                               <div className="flex items-start gap-4">
                                   <Avatar>
                                       <AvatarImage src={`https://i.pravatar.cc/128?u=${review.userId}`} />
                                       <AvatarFallback>{review.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                                   </Avatar>
                                   <div>
                                       <div className="flex items-center justify-between w-full">
                                            <p className="font-semibold">{review.userName}</p>
                                            {renderStars(review.rating)}
                                       </div>
                                       <p className="text-sm text-muted-foreground">{review.serviceName}</p>
                                   </div>
                               </div>
                               <p className="mt-4 text-muted-foreground italic">"{review.comment}"</p>
                               <p className="text-right text-xs text-muted-foreground mt-4">{formatDate(review.createdAt)}</p>
                           </CardContent>
                       </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>No reviews have been submitted yet.</p>
                </div>
            )}
        </div>
    </div>
  );
}
