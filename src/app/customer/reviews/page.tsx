
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const reviews = [
  { id: 'RV001', service: 'Maid Service', date: '2023-06-23', rating: 5, comment: 'Amazing job! The house has never been cleaner. The cleaner was professional and very thorough.' },
  { id: 'RV002', service: 'Tank Cleaning', date: '2023-05-12', rating: 4, comment: 'Good service, the tank is clean. They arrived a bit late, but the work was done well.' },
  { id: 'RV003', service: 'Bathroom Cleaning', date: '2023-04-18', rating: 5, comment: 'Excellent work. My bathroom is sparkling. Highly recommend!' },
];

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reviews</CardTitle>
        <CardDescription>A log of all the feedback you've provided.</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <React.Fragment key={review.id}>
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{review.service}</h3>
                                    <p className="text-sm text-muted-foreground">{review.date}</p>
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

import React from "react";
