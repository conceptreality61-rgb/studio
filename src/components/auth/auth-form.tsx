
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type AuthFormProps = {
  isSignUp?: boolean;
};

type Role = 'customer' | 'worker' | 'manager';

const SUPERADMIN_EMAIL = 'manager@cleansweep.com';

function AuthFormFields({ isSignUp, role, onAuthSuccess }: { isSignUp?: boolean; role: Role; onAuthSuccess: (role: Role) => void; }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (isSignUp) {
        if (role === 'manager' && email !== SUPERADMIN_EMAIL) {
            toast({
                variant: 'destructive',
                title: 'Sign-up Error',
                description: 'Manager sign-up is only allowed for the superadmin email.',
            });
            setIsLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name || (role === 'manager' ? 'Super Manager' : 'New User') });

        // Save user role and other info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: name || (role === 'manager' ? 'Super Manager' : 'New User'),
            role: role,
            createdAt: serverTimestamp(),
            ...(role === 'worker' && { verificationStatus: 'Pending' })
        });
        
        toast({ title: 'Account created successfully!' });
        onAuthSuccess(role);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === role) {
            toast({ title: 'Logged in successfully!' });
            onAuthSuccess(role);
        } else {
            await auth.signOut();
            throw new Error(`You are not authorized to log in as a ${role}.`);
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter your email address.' });
        return;
    }
    setIsResetting(true);
    try {
        await sendPasswordResetEmail(auth, resetEmail);
        toast({
            title: 'Password Reset Email Sent',
            description: 'Check your inbox for a link to reset your password.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
        });
    } finally {
        setIsResetting(false);
    }
  }

  const buttonText = isSignUp ? 'Sign Up' : 'Log In';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && role !== 'manager' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
      )}
       {isSignUp && role === 'manager' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Super Manager" defaultValue="Super Manager" />
          </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required 
            defaultValue={role === 'manager' ? SUPERADMIN_EMAIL : ''}
            readOnly={role === 'manager'}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button type="button" className="text-sm font-medium text-primary hover:underline">Forgot Password?</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
                            <AlertDialogDescription>
                                Enter your email address below and we'll send you a link to reset your password.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">Email Address</Label>
                            <Input id="reset-email" type="email" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePasswordReset} disabled={isResetting}>
                                {isResetting && <Loader2 className="animate-spin" />}
                                {isResetting ? 'Sending...' : 'Send Reset Link'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : buttonText}
      </Button>
    </form>
  );
}

export function AuthForm({ isSignUp = false }: AuthFormProps) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<Role>('customer');

  const title = isSignUp ? 'Create an Account' : 'Welcome Back';
  const description = isSignUp ? "Choose your role and let's get started." : 'Log in to access your dashboard.';

  const handleAuthSuccess = async (role: Role) => {
    // Check if user exists in Firestore, if not, wait a bit for replication
    if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists()) {
            await new Promise(res => setTimeout(res, 1000));
        }
    }

    const getRedirectPath = (selectedRole: Role) => {
      switch (selectedRole) {
        case 'manager':
          return '/manager';
        case 'worker':
          return '/worker';
        default:
          return '/customer';
      }
    };
    router.push(getRedirectPath(role));
    router.refresh(); // Force a refresh to ensure layout gets user data
  }

  const onTabChange = (value: string) => {
    setCurrentTab(value as Role);
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer" className="w-full" onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="worker">Worker</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
          </TabsList>
          <TabsContent value="customer" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="customer" onAuthSuccess={() => handleAuthSuccess('customer')} />
          </TabsContent>
          <TabsContent value="worker" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="worker" onAuthSuccess={() => handleAuthSuccess('worker')} />
          </TabsContent>
          <TabsContent value="manager" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="manager" onAuthSuccess={() => handleAuthSuccess('manager')}/>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center text-sm">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Log In
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Link href="/signup" className="underline hover:text-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
