
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
import { useState, useEffect } from 'react';
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

function getRedirectPath(role: Role) {
  switch (role) {
    case 'manager':
      return '/manager';
    case 'worker':
      return '/worker/tasks';
    default:
      return '/customer';
  }
};

function SignUpFormFields({ role, onAuthSuccess }: { role: Role; onAuthSuccess: (role: Role) => void; }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
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

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: name || (role === 'manager' ? 'Super Manager' : 'New User'),
            role: role,
            createdAt: serverTimestamp(),
        });
        
        toast({ title: 'Account created successfully!' });
        onAuthSuccess(role);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {role !== 'manager' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
      )}
       {role === 'manager' && (
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
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
      </Button>
    </form>
  );
}

function LoginForm({ role, onAuthSuccess }: { role: Role, onAuthSuccess: (role: Role) => void; }) {
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
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check 'users' collection first (managers, customers)
      let userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
          const userRole = userDoc.data().role as Role;
          if (userRole === role) {
            toast({ title: 'Logged in successfully!' });
            onAuthSuccess(userRole);
            return;
          } else {
             await auth.signOut();
             throw new Error(`You are not authorized to log in as a ${role}.`);
          }
      }

      // If not in 'users', check 'workers' collection
      if (role === 'worker') {
        const workerDoc = await getDoc(doc(db, 'workers', user.uid));
        if (workerDoc.exists()) {
             toast({ title: 'Logged in successfully!' });
             onAuthSuccess('worker');
             return;
        }
      }
      
      await auth.signOut();
      throw new Error(`Your user data could not be found for the selected role.`);

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

  return (
     <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${role}-email`}>Email</Label>
        <Input id={`${role}-email`} name="email" type="email" placeholder="m@example.com" required 
         defaultValue={role === 'manager' ? SUPERADMIN_EMAIL : ''}
         readOnly={role === 'manager'}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor={`${role}-password`}>Password</Label>
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
        </div>
        <Input id={`${role}-password`} name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
      </Button>
    </form>
  )
}


export function AuthForm({ isSignUp = false }: AuthFormProps) {
  const router = useRouter();

  const handleAuthSuccess = (role: Role) => {
    const path = getRedirectPath(role);
    router.push(path);
  };
  
  if (isSignUp) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Choose your role and let's get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="manager">Manager</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" className="mt-4">
              <SignUpFormFields role="customer" onAuthSuccess={handleAuthSuccess} />
            </TabsContent>
            <TabsContent value="manager" className="mt-4">
              <SignUpFormFields role="manager" onAuthSuccess={handleAuthSuccess}/>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Log In
              </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Login Form
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
        <CardDescription>Log in to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="manager">Manager</TabsTrigger>
            </TabsList>
            <TabsContent value="customer" className="mt-4">
              <LoginForm role="customer" onAuthSuccess={handleAuthSuccess} />
            </TabsContent>
            <TabsContent value="manager" className="mt-4">
              <LoginForm role="manager" onAuthSuccess={handleAuthSuccess}/>
            </TabsContent>
          </Tabs>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline hover:text-primary">
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}