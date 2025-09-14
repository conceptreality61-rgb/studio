'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AuthFormProps = {
  isSignUp?: boolean;
};

function AuthFormFields({ isSignUp, role }: { isSignUp?: boolean; role: 'customer' | 'worker' | 'admin' }) {
  const buttonText = isSignUp ? 'Sign Up' : 'Log In';

  return (
    <div className="space-y-4">
      {isSignUp && (
        <>
          {role !== 'admin' && (
            <div className="space-y-2">
              <Label htmlFor={`${role}-name`}>Full Name</Label>
              <Input id={`${role}-name`} placeholder="John Doe" required />
            </div>
          )}
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${role}-email`}>Email</Label>
        <Input id={`${role}-email`} type="email" placeholder="m@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${role}-password`}>Password</Label>
        <Input id={`${role}-password`} type="password" required />
      </div>
      {isSignUp && role === 'worker' && (
        <div className="space-y-2">
          <Label htmlFor="worker-skills">Skills</Label>
          <Input id="worker-skills" placeholder="e.g., Cleaning, Gardening" />
        </div>
      )}
      <Button type="submit" className="w-full">
        {buttonText}
      </Button>
    </div>
  );
}

export function AuthForm({ isSignUp = false }: AuthFormProps) {
  const title = isSignUp ? 'Create an Account' : 'Welcome Back';
  const description = isSignUp ? "Choose your role and let's get started." : 'Log in to access your dashboard.';

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="worker">Worker</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="customer" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="customer" />
          </TabsContent>
          <TabsContent value="worker" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="worker" />
          </TabsContent>
          <TabsContent value="admin" className="mt-4">
            <AuthFormFields isSignUp={isSignUp} role="admin" />
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
