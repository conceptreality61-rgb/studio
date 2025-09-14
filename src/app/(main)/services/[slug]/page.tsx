
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { services } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Clock } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ServiceDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setDate(new Date());
  }, []);

  const service = services.find((s) => s.id === params.slug);

  if (!service) {
    notFound();
  }
  
  const handleOptionChange = (subCategoryId: string, optionId: string, type: 'single' | 'multiple') => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev };
      if (type === 'single') {
        newOptions[subCategoryId] = optionId;
      } else {
        const currentSelection = (newOptions[subCategoryId] as string[] | undefined) || [];
        if (currentSelection.includes(optionId)) {
          newOptions[subCategoryId] = currentSelection.filter(id => id !== optionId);
        } else {
          newOptions[subCategoryId] = [...currentSelection, optionId];
        }
      }
      return newOptions;
    });
  };

  const isBookingDisabled = () => {
    if (!date || !selectedTime) return true;
    if (service.subCategories) {
      for (const subCategory of service.subCategories) {
        const selection = selectedOptions[subCategory.id];
        if (!selection || (Array.isArray(selection) && selection.length === 0)) {
          return true;
        }
      }
    }
    return false;
  };

  const handleBooking = () => {
    if (user) {
      // Proceed with booking logic, now including selectedOptions
      console.log({
        serviceId: service.id,
        date,
        time: selectedTime,
        options: selectedOptions,
      });
      router.push('/customer/bookings');
    } else {
      router.push('/login');
    }
  };

  const placeholder = PlaceHolderImages.find((p) => p.id === service.imageId);
  const timeSlots = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];
  
  const subCategories = service.subCategories || [];


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
              <p className="mt-4 text-muted-foreground">{service.longDescription}</p>
            </div>
          </div>
          <div className="row-start-1 md:row-start-auto">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold font-headline text-center mb-4">Book This Service</h2>
                
                <div className='space-y-6'>
                    {subCategories.map(subCategory => (
                        <div key={subCategory.id}>
                            <h3 className="font-semibold mb-2">{subCategory.name}</h3>
                            {subCategory.type === 'single' ? (
                               <RadioGroup
                                  value={selectedOptions[subCategory.id] as string || ''}
                                  onValueChange={(value) => handleOptionChange(subCategory.id, value, 'single')}
                                  className={subCategory.id.includes('duration') || subCategory.id.includes('num-bathrooms') || subCategory.id.includes('num-tanks') ? 'grid grid-cols-2 gap-2' : ''}
                                >
                                {subCategory.options.map(option => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.id} id={`${subCategory.id}-${option.id}`} />
                                        <Label htmlFor={`${subCategory.id}-${option.id}`} className="font-normal">{option.name}</Label>
                                    </div>
                                ))}
                               </RadioGroup>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {subCategory.options.map(option => (
                                        <div key={option.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${subCategory.id}-${option.id}`}
                                                checked={(selectedOptions[subCategory.id] as string[] | undefined)?.includes(option.id) || false}
                                                onCheckedChange={() => handleOptionChange(subCategory.id, option.id, 'multiple')}
                                            />
                                            <Label htmlFor={`${subCategory.id}-${option.id}`} className="font-normal">{option.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <div>
                        <h3 className="font-semibold mb-2">Select a Date</h3>
                        <div className="flex justify-center rounded-md border">
                           {isClient && (
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1))}
                                />
                           )}
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-2">Select a Time Slot</h3>
                        <RadioGroup
                            value={selectedTime || ''}
                            onValueChange={setSelectedTime}
                            className="grid grid-cols-2 gap-2"
                        >
                        {timeSlots.map((time) => (
                            <div key={time} className="flex items-center space-x-2">
                                <RadioGroupItem value={time} id={`time-${time}`} />
                                <Label htmlFor={`time-${time}`} className="flex items-center gap-2 font-normal cursor-pointer">
                                    <Clock className="w-4 h-4" />
                                    {time}
                                </Label>
                            </div>
                        ))}
                        </RadioGroup>
                    </div>
                </div>

                <Button size="lg" className="w-full mt-6" disabled={isBookingDisabled()} onClick={handleBooking}>
                  {user ? 'Confirm Booking' : 'Log in to Book'}
                </Button>
                {isBookingDisabled() && <p className="text-center text-sm text-muted-foreground mt-2">Please select a date, time, and all required options.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
