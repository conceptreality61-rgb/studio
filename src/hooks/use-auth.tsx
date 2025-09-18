
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type Role = 'customer' | 'worker' | 'manager';

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userRole: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // First, try to get user from 'users' collection (customers, managers)
          let userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as Role);
          } else {
            // If not in 'users', check 'workers' collection
            userDoc = await getDoc(doc(db, 'workers', user.uid));
            if (userDoc.exists()) {
              setUserRole('worker');
            } else {
              setUserRole(null);
            }
          }
        } catch (e) {
          console.error("Error fetching user role", e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useRequireAuth = (requiredRole?: Role) => {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (requiredRole && userRole && userRole !== requiredRole) {
            // Redirect user to their correct dashboard if they are in the wrong section
            switch (userRole) {
                case 'manager':
                    router.push('/manager');
                    break;
                case 'worker':
                    router.push('/worker/tasks');
                    break;
                case 'customer':
                    router.push('/customer');
                    break;
                default:
                    router.push('/');
            }
        }
    }, [user, userRole, loading, router, requiredRole]);

    return { user, userRole, loading };
};
