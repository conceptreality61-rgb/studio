import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Service } from '@/lib/constants';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: FC<ServiceCardProps> = ({ service }) => {
  const placeholder = PlaceHolderImages.find((p) => p.id === service.imageId);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      {placeholder && (
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description}
            width={400}
            height={300}
            data-ai-hint={placeholder.imageHint}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <service.icon className="w-6 h-6 text-primary" />
          {service.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <CardDescription className="flex-grow">{service.description}</CardDescription>
        <Button asChild className="mt-4 w-full" variant="outline">
          <Link href={`/services/${service.id}`}>
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
