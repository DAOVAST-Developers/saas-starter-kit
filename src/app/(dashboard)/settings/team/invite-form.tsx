'use client';

import { useState } from 'react';
import { inviteMember } from './actions';

export function InviteForm({ orgId }: { orgId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await inviteMember({ orgId, email, role });
    setPending(false);
    setMessage({ ok: result.success, text: result.message });
    if (result.success) setEmail('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 space-y-2">
        <label htmlFor="invite-email" className="text-sm font-medium">Email</label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="invite-role" className="text-sm font-medium">Role</label>
        <select
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send invite'}
      </button>
      {message && (
        <p className={`w-full text-sm ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
