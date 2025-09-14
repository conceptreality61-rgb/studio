'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

const bookings = [
  { date: new Date('2023-06-24T11:00:00'), service: 'Gardening', customer: 'Olivia Smith' },
  { date: new Date('2023-06-25T09:00:00'), service: 'Maid Service', customer: 'John Doe' },
  { date: new Date('2023-06-28T14:00:00'), service: 'Bathroom Cleaning', customer: 'Emma Brown' },
];

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const bookingsForSelectedDay = date ? bookings.filter(b => isSameDay(b.date, date)) : [];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>My Schedule</CardTitle>
            <CardDescription>View your upcoming confirmed tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                booked: bookings.map(b => b.date),
              }}
              modifiersStyles={{
                booked: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))',
                },
              }}
            />
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
            {bookingsForSelectedDay.length > 0 ? (
              <ul className="space-y-4">
                {bookingsForSelectedDay.map(booking => (
                  <li key={booking.date.toISOString()} className="p-3 rounded-md bg-secondary">
                    <p className="font-semibold">{booking.service}</p>
                    <p className="text-sm text-muted-foreground">For: {booking.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      Time: {booking.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No tasks scheduled for this day.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
