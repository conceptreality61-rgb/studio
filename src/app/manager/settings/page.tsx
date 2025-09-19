
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRequireAuth } from '@/hooks/use-auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const MANAGER_EMAIL = 'conceptreality61@gmail.com';

export default function ManagerSettingsPage() {
    const { user, loading } = useRequireAuth('manager');
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);
    
    const handleSendResetLink = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in as a manager.'});
            return;
        }
        
        setIsSending(true);
        try {
            await sendPasswordResetEmail(auth, MANAGER_EMAIL);
            toast({ 
                title: 'Password Reset Link Sent', 
                description: `A password reset link has been sent to ${MANAGER_EMAIL}. Please check your inbox.` 
            });
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSending(false);
        }
    }

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-48" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <div className="grid gap-6">
         <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account password.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    To change your password, we will send a secure link to your registered email address ({MANAGER_EMAIL}). Click the button below to receive your link.
                </p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSendResetLink} disabled={isSending}>
                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSending ? 'Sending Link...' : 'Send Password Reset Link'}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
