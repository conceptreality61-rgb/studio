
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/worker/tasks');
  }, [router]);

  return null;
}
