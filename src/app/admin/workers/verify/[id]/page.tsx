'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Mock worker data
const worker = { 
    id: 'W003', 
    name: 'Aiden Garcia', 
    email: 'aiden@provider.com', 
    skills: ['Tank Cleaning'], 
    status: 'Pending', 
    rating: 0,
    bio: 'Experienced and certified tank cleaner with 5 years of experience in residential and commercial properties. Committed to providing safe and thorough cleaning services.',
    idUrl: 'https://picsum.photos/seed/id-doc/600/400',
    certUrl: 'https://picsum.photos/seed/cert-doc/600/400',
};

export default function VerifyWorkerPage({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleApprove = () => {
        // Here you would typically call an API to update the worker's status
        toast({
            title: "Worker Approved",
            description: `${worker.name} has been approved and can now accept tasks.`,
        });
        router.push('/admin/workers');
    };
    
    const handleReject = () => {
        // Here you would typically call an API to update the worker's status
        toast({
            variant: "destructive",
            title: "Worker Rejected",
            description: `${worker.name} has been rejected.`,
        });
        router.push('/admin/workers');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://i.pravatar.cc/128?u=${worker.id}`} />
                    <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-3xl">{worker.name}</CardTitle>
                    <CardDescription className="text-base">{worker.email}</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {worker.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Biography</h3>
                        <p className="text-muted-foreground">{worker.bio}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Submitted Documents</h3>
                        <div className="space-y-4">
                           <div>
                                <h4 className="font-semibold">Identification Document</h4>
                                <img src={worker.idUrl} alt="ID Document" className="mt-2 rounded-lg border aspect-video object-cover" />
                           </div>
                           <div>
                                <h4 className="font-semibold">Professional Certification</h4>
                                <img src={worker.certUrl} alt="Certification" className="mt-2 rounded-lg border aspect-video object-cover" />
                           </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-6">
                <Button variant="destructive" onClick={handleReject}>
                    <X className="mr-2" />
                    Reject
                </Button>
                <Button onClick={handleApprove}>
                    <Check className="mr-2" />
                    Approve
                </Button>
            </CardFooter>
        </Card>
    )
}
