
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isSameDay } from 'date-fns';
import Link from 'next/link';

type Booking = {
  id: string;
  serviceName: string;
  date: Timestamp;
  time: string;
  status: string;
};

export default function SchedulePage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'bookings'),
          where('workerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const workerBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(workerBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const bookingsForSelectedDay = bookings.filter(booking => 
    isSameDay(booking.date.toDate(), selectedDate)
  ).sort((a,b) => a.time.localeCompare(b.time));

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="w-full"
                    modifiers={{
                        booked: bookings.map(b => b.date.toDate())
                    }}
                    modifiersStyles={{
                        booked: {
                            fontWeight: 'bold',
                            textDecoration: 'underline'
                        }
                    }}
                />
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks for {format(selectedDate, 'PPP')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : bookingsForSelectedDay.length > 0 ? (
                <div className="space-y-4">
                    {bookingsForSelectedDay.map(booking => (
                        <Link href={`/worker/tasks/${booking.id}`} key={booking.id} className="block hover:bg-secondary rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{booking.serviceName}</p>
                                    <p className="text-sm text-muted-foreground">{booking.time}</p>
                                </div>
                                <Badge>{booking.status}</Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tasks scheduled for this day.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
