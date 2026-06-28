import Link from 'next/link';
import { requireAdmin } from '@/lib/guards/admin';
import { createAdminClient } from '@/lib/supabase/admin';

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createAdminClient();

  let query = admin
    .from('profiles')
    .select('id, full_name, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) {
    query = query.ilike('full_name', `%${q}%`);
  }

  const { data: users, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search by name…"
          className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button className="rounded-md border border-border px-4 py-2 text-sm font-medium">
          Search
        </button>
      </form>

      <section className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(users ?? []).map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.full_name ?? u.id}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {currentPage} of {totalPages} · {count ?? 0} users
        </span>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Link
              href={`/admin/users?page=${currentPage - 1}${q ? `&q=${q}` : ''}`}
              className="rounded-md border border-border px-3 py-1"
            >
              Previous
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={`/admin/users?page=${currentPage + 1}${q ? `&q=${q}` : ''}`}
              className="rounded-md border border-border px-3 py-1"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
