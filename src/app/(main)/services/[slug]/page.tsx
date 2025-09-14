
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { services } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Clock } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const resolvedParams = React.use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const service = services.find((s) => s.id === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const handleBooking = () => {
    if (user) {
      // Proceed with booking logic
      alert('Booking confirmed!');
    } else {
      router.push('/login');
    }
  };

  const placeholder = PlaceHolderImages.find((p) => p.id === service.imageId);
  const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

  return (
    <div className="bg-secondary">
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            {placeholder && (
              <Card className="overflow-hidden">
                <Image
                  src={placeholder.imageUrl}
                  alt={placeholder.description}
                  width={600}
                  height={400}
                  data-ai-hint={placeholder.imageHint}
                  className="w-full h-auto object-cover"
                />
              </Card>
            )}
            <div className="mt-6">
              <h1 className="text-3xl md:text-4xl font-bold font-headline">{service.name}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">${service.price}/hr</p>
              <p className="mt-4 text-muted-foreground">{service.longDescription}</p>
            </div>
          </div>
          <div className="row-start-1 md:row-start-auto">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold font-headline text-center mb-4">Book This Service</h2>
                <h3 className="font-semibold mb-2">Select a Date</h3>
                <div className="flex justify-center rounded-md border">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                </div>
                
                <h3 className="font-semibold mt-6 mb-2">Select a Time Slot</h3>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      {time}
                    </Button>
                  ))}
                </div>

                <Button size="lg" className="w-full mt-6" disabled={!date || !selectedTime} onClick={handleBooking}>
                  {user ? 'Confirm Booking' : 'Log in to Book'}
                </Button>
                {!date || !selectedTime && <p className="text-center text-sm text-muted-foreground mt-2">Please select a date and time.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
