
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WorkerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/worker/tasks');
  }, [router]);
  return null;
}
