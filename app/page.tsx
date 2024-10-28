'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard';

export default function Home() {
  const router = useRouter();

  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end p-4">
        <div className="inline-flex rounded-lg border border-gray-200">
          <Button
            variant="ghost"
            className="rounded-l-lg"
            onClick={() => router.push('/')}
          >
            Weekly
          </Button>
          <Button
            variant="ghost"
            className="rounded-r-lg"
            onClick={() => router.push('/monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Weekly Dashboard Content */}
      <Dashboard />
    </div>
  );
}
