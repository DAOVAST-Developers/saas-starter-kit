'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInvitation } from './actions';

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setPending(true);
    setError(null);
    const result = await acceptInvitation(token);
    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.message);
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAccept}
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending ? 'Accepting…' : 'Accept invitation'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
