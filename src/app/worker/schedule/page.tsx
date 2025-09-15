
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type Booking = {
  date: Timestamp;
  serviceName: string;
  customerName: string;
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'bookings'),
          where('workerId', '==', user.uid),
          where('status', 'in', ['Worker Assigned', 'In Progress'])
        );
        const querySnapshot = await getDocs(q);
        const workerBookings = querySnapshot.docs.map(doc => doc.data() as Booking);
        setBookings(workerBookings);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const bookedDates = bookings.map(b => b.date.toDate());
  const bookingsForSelectedDay = date ? bookings.filter(b => isSameDay(b.date.toDate(), date)) : [];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>My Schedule</CardTitle>
            <CardDescription>View your upcoming confirmed tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {loading ? <Skeleton className="w-full h-[300px]" /> : (isClient && (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    booked: bookedDates,
                  }}
                  modifiersStyles={{
                    booked: {
                      color: 'hsl(var(--primary-foreground))',
                      backgroundColor: 'hsl(var(--primary))',
                    },
                  }}
                />
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
             <CardTitle>
                Tasks for {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '...'}
             </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-24" /> : bookingsForSelectedDay.length > 0 ? (
              <ul className="space-y-4">
                {bookingsForSelectedDay.map(booking => (
                  <li key={booking.date.toDate().toISOString()} className="p-3 rounded-md bg-secondary">
                    <p className="font-semibold">{booking.serviceName}</p>
                    <p className="text-sm text-muted-foreground">For: {booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      Time: {booking.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-10">No tasks scheduled for this day.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
