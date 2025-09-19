
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export type ReviewData = {
    rating: number;
    comment: string;
    userName: string;
    userId: string;
    bookingId: string;
}

export async function featureReview(review: ReviewData) {
  try {
    const testimonialsRef = collection(db, 'testimonials');
    
    // Check if this review is already featured
    const q = query(testimonialsRef, where('bookingId', '==', review.bookingId));
    const existing = await getDocs(q);
    if (!existing.empty) {
        return { success: false, error: 'This review is already featured.' };
    }

    // In a real app, you might want to fetch the customer's location and avatar URL
    // from their user profile. For now, we'll use placeholders.
    await addDoc(testimonialsRef, {
        name: review.userName,
        location: 'India', // Placeholder
        rating: review.rating,
        comment: review.comment,
        avatar: `https://i.pravatar.cc/150?u=${review.userId}`, // Placeholder avatar
        bookingId: review.bookingId,
        createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error featuring review:", error);
    return { success: false, error: 'Failed to feature the review.' };
  }
}
