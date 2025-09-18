
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { customerNavItems } from '@/lib/constants';
import Logo from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DoorOpen } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import React, { useEffect, useState } from 'react';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useRequireAuth('customer');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isNavItemActive = (itemHref: string) => {
    if (itemHref === '/customer') {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  }

  if (!isClient || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {customerNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.action === 'logout' ? (
                  <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span className="font-bold text-base">{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={isNavItemActive(item.href)}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span className="font-bold text-base">{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="p-2">
             {loading ? (
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className='space-y-2'>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
             ) : user ? (
                <div className="flex items-center gap-3 p-2 rounded-md bg-secondary">
                  <Avatar>
                      <AvatarImage src={user.photoURL ?? undefined} />
                      <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="font-semibold text-sm">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">customer</p>
                  </div>
                </div>
             ) : (
                <p>Not logged in</p>
             )}
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className='flex items-center gap-4'>
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold capitalize">
              {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
