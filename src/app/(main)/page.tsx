
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/service-card';
import { services } from '@/lib/constants';
import { CheckCircle, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero');

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-white">
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30" />
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
            Your Home, Spotlessly Clean
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow-md">
            Book trusted and professional household services in just a few clicks.
            From cleaning to gardening, we've got you covered.
          </p>
          <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="#services">Book a Service</Link>
          </Button>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Services</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Choose from a variety of professional services to keep your home in perfect shape.
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

      <section id="pricing" className="py-16 md:py-24 bg-background">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">Transparent Pricing</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            No hidden fees. Simple, upfront pricing for all our services.
          </p>
          <div className="mt-12 flex justify-center">
            <Card className="w-full">
              <div className="p-6">
                <ul className="space-y-4">
                  {services.map((service) => (
                    <li key={service.id} className="flex justify-between items-center border-b pb-2">
                      <span className="text-lg">{service.name}</span>
                      <span className="text-lg font-bold text-primary">Rs.{service.price}/hr</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-4">* Prices may vary based on specific requirements.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
