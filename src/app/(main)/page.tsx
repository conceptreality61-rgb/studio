
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/service-card';
import { services } from '@/lib/constants';
import { CheckCircle, Users, Calendar, Star, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  createdAt: Timestamp;
};

type Review = {
  id: string;
  userName: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  serviceName: string;
}

// Extend the Window interface to include the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}


export default function HomePage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero');
  const pwaImage = PlaceHolderImages.find((p) => p.id === 'pwa-install');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    }
  };


  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedTestimonials = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonials(fetchedTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials: ", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    
    const fetchLatestReviews = async () => {
        try {
            const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(3));
            const querySnapshot = await getDocs(q);
            const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
            setLatestReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching latest reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    fetchTestimonials();
    fetchLatestReviews();
  }, []);

  const formatTimestamp = (timestamp?: Timestamp) => {
    if (!timestamp) return null;
    return timestamp.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
        <Star key={i} className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };


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

      {installPrompt && (
        <section id="pwa-install" className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">Get Our App</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Experience CleanSweep on the go! Install our Progressive Web App (PWA) on your phone or desktop for a faster, app-like experience. No app store required!
                </p>
                <p className="mt-2 text-muted-foreground">
                  Get quick access to booking, tracking, and managing your services with a single tap.
                </p>
                <Button size="lg" className="mt-8" onClick={handleInstallClick}>
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
              </div>
              <div className="flex justify-center">
                  {pwaImage && (
                      <Image
                          src={pwaImage.imageUrl}
                          alt={pwaImage.description}
                          width={600}
                          height={500}
                          className="rounded-lg shadow-xl"
                          data-ai-hint={pwaImage.imageHint}
                      />
                  )}
              </div>
            </div>
          </div>
        </section>
      )}


      <section id="testimonials" className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">What Our Customers Say</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Read real stories from satisfied customers.
            </p>
          </div>
           {loadingTestimonials ? (
                <div className="flex justify-center mt-12">
                    <Skeleton className="h-64 w-full max-w-4xl" />
                </div>
            ) : testimonials.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto mt-12"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
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
                          <p className="text-sm text-muted-foreground">{formatTimestamp(testimonial.createdAt)}</p>
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
           ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>No testimonials yet. Check back soon!</p>
                </div>
           )}
        </div>
      </section>

       <section id="reviews" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Latest Reviews</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              See what people are saying about our services right now.
            </p>
          </div>
          <div className="mt-12">
            {loadingReviews ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : latestReviews.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestReviews.map((review) => (
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
                                            <div className="flex items-center">{renderStars(review.rating)}</div>
                                       </div>
                                       <p className="text-sm text-muted-foreground">{review.serviceName}</p>
                                   </div>
                               </div>
                               <p className="mt-4 text-muted-foreground italic">"{review.comment}"</p>
                               <p className="text-right text-xs text-muted-foreground mt-4">{formatTimestamp(review.createdAt)}</p>
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
             <div className="text-center mt-12">
                <Button asChild variant="outline">
                    <Link href="/reviews">View All Reviews</Link>
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}
