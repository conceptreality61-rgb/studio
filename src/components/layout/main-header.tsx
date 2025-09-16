
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DoorOpen, LayoutDashboard } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

function getRedirectPath(role: string) {
  switch (role) {
    case 'manager':
      return '/manager';
    case 'worker':
      return '/worker';
    default:
      return '/customer';
  }
};

export default function MainHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && !userRole) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
        }
      } else if (!user) {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [user, userRole]);

  const handleLogout = async () => {
    await signOut(auth);
    setUserRole(null);
    router.push('/');
  };

  const handleDashboard = () => {
    if(userRole) {
      router.push(getRedirectPath(userRole));
    }
  }

  return (
    <header className="bg-card sticky top-0 z-40 border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <Logo className="text-primary" />
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-base font-medium">
          <Link href="/#services" className="transition-colors hover:text-primary">
            Our Services
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-primary">
            How It Works
          </Link>
          <Link href="/#testimonials" className="transition-colors hover:text-primary">
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userRole && (
                        <DropdownMenuItem onClick={handleDashboard} className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span className="font-bold text-base">Dashboard</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <DoorOpen className="mr-2 h-4 w-4" />
                        <span>Log Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-base">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="text-base">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
