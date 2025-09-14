
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type AuthFormProps = {
  isSignUp?: boolean;
};

type Role = 'customer' | 'worker' | 'admin';

function AuthFormFields({ isSignUp, role, onAuthSuccess }: { isSignUp?: boolean; role: Role; onAuthSuccess: () => void; }) {
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
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Here you would typically save role and other info to a database like Firestore
        toast({ title: 'Account created successfully!' });
        onAuthSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Logged in successfully!' });
        onAuthSuccess();
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

  const buttonText = isSignUp ? 'Sign Up' : 'Log In';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <>
          {role !== 'admin' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
          )}
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {isSignUp && role === 'worker' && (
        <div className="space-y-2">
          <Label htmlFor="worker-skills">Skills</Label>
          <Input id="worker-skills" name="worker-skills" placeholder="e.g., Cleaning, Gardening" />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : buttonText}
      </Button>
    </form>
  );
}

export function AuthForm({ isSignUp = false }: AuthFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Role>('customer');

  const title = isSignUp ? 'Create an Account' : 'Welcome Back';
  const description = isSignUp ? "Choose your role and let's get started." : 'Log in to access your dashboard.';

  const handleAuthSuccess = () => {
    const getRedirectPath = (selectedRole: Role) => {
      switch (selectedRole) {
        case 'admin':
          return '/admin';
        case 'worker':
          return '/worker';
        default:
          return '/customer';
      }
    };
    router.push(getRedirectPath(activeTab));
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer" className="w-full" onValueChange={(value) => setActiveTab(value as Role)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="worker">Worker</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="customer" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="customer" onAuthSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="worker" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="worker" onAuthSuccess={handleAuthSuccess} />
          </TabsContent>
          <TabsContent value="admin" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="admin" onAuthSuccess={handleAuthSuccess}/>
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
