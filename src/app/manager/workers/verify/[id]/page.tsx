
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Mock data, in a real app this would be fetched based on the id
const workerApplication = {
  id: 'W003',
  name: 'Lucas Hernandez',
  email: 'lucas.h@example.com',
  phone: '(555) 123-9876',
  address: '789 Pine St, Metro City',
  appliedDate: '2023-06-01',
  services: ['Maid Service', 'Gardening'],
  bio: 'Experienced and reliable worker with 5+ years in home services. I am detail-oriented and committed to providing the best customer experience.',
  idUrl: 'https://picsum.photos/seed/id-doc/600/400',
  certUrl: 'https://picsum.photos/seed/cert-doc/600/400',
};


export default function VerifyWorkerPage({ params }: { params: { id: string }}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verify Worker Application</CardTitle>
                <CardDescription>Review the details and documents for worker #{params.id}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-lg font-semibold">{workerApplication.name}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-lg font-semibold">{workerApplication.email}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-lg font-semibold">{workerApplication.phone}</p>
                    </div>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-lg font-semibold">{workerApplication.address}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-muted-foreground">{workerApplication.bio}</p>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h4 className="font-semibold">Applied Services</h4>
                    <div className="flex flex-wrap gap-2">
                        {workerApplication.services.map(service => (
                            <Badge key={service} variant="secondary">{service}</Badge>
                        ))}
                    </div>
                </div>
                <Separator />
                 <div className="space-y-4">
                    <h4 className="font-semibold">Submitted Documents</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className='space-y-2'>
                           <p className='font-medium'>Identification Document</p>
                           <a href={workerApplication.idUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-lg overflow-hidden border">
                             <Image src={workerApplication.idUrl} alt="ID Document" layout="fill" objectFit="cover" />
                           </a>
                           <Button variant="outline" size="sm" asChild><a href={workerApplication.idUrl} download><Download className="mr-2" />Download</a></Button>
                        </div>
                         <div className='space-y-2'>
                           <p className='font-medium'>Professional Certification</p>
                           <a href={workerApplication.certUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-lg overflow-hidden border">
                              <Image src={workerApplication.certUrl} alt="Certificate" layout="fill" objectFit="cover" />
                           </a>
                           <Button variant="outline" size="sm" asChild><a href={workerApplication.certUrl} download><Download className="mr-2" />Download</a></Button>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive"><X className="mr-2"/>Reject</Button>
                <Button><Check className="mr-2"/>Approve</Button>
            </CardFooter>
        </Card>
    )
}
