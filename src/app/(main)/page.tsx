
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/service-card';
import { services } from '@/lib/constants';
import { CheckCircle, Users, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero');

  const testimonials = [
    {
      name: 'Sarah L.',
      location: 'Mumbai',
      rating: 5,
      comment: "The cleaning service was impeccable! My home has never looked this good. The team was professional, punctual, and paid attention to every little detail. Highly recommended!",
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    {
      name: 'Rajesh K.',
      location: 'Delhi',
      rating: 5,
      comment: "I've tried several gardening services before, but CleanSweep is by far the best. My garden is thriving, and the team is so knowledgeable and friendly.",
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    },
    {
      name: 'Priya M.',
      location: 'Bangalore',
      rating: 4,
      comment: "The booking process was so simple and convenient. The bathroom cleaning was thorough, though they were a little late. Overall, a great experience.",
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    },
     {
      name: 'Amit S.',
      location: 'Pune',
      rating: 5,
      comment: "Finally, a reliable service for water tank cleaning. They were professional, efficient, and now I have peace of mind about my water quality. Excellent job!",
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/30" />
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-extrabold drop-shadow-lg bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
            Your Home, Spotlessly Clean
          </h1>
          <p className="mt-4 max-w-2xl text-xl md:text-2xl drop-shadow-md bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent font-bold">
            Book trusted and professional household services in just a few clicks. "From spotless bathrooms to healthy gardens, we make your home shine inside and out."
          </p>
          <Button size="lg" className="mt-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full" asChild>
            <Link href="#services">Book a Service</Link>
          </Button>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Services</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Your home deserves the best care. Choose a service and let our experts do the rest.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Getting your home serviced is as easy as 1-2-3.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary/20 text-primary p-4 rounded-full">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold font-headline">1. Book a Service</h3>
              <p className="mt-2 text-muted-foreground">
                Select the service you need and choose a convenient time slot.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/20 text-primary p-4 rounded-full">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold font-headline">2. We Assign a Pro</h3>
              <p className="mt-2 text-muted-foreground">
                A skilled and verified professional is assigned to your job.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary/20 text-primary p-4 rounded-full">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold font-headline">3. Relax and Enjoy</h3>
              <p className="mt-2 text-muted-foreground">
                Our expert takes care of everything. Enjoy your clean and happy home!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">What Our Customers Say</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Read real stories from satisfied customers.
            </p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto mt-12"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                        <Avatar className="mb-4 h-16 w-16">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-muted-foreground italic flex-grow">"{testimonial.comment}"</p>
                        <div className="mt-4">
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>
    </div>
  );
}
