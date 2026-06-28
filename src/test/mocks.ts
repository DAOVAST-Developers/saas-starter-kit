// Shared test mocks for Supabase SSR, next/headers, next/cache, and Stripe.

export interface MockQueryResult {
  data: unknown;
  error: unknown;
  count?: number;
}

/**
 * Builds a chainable Supabase query-builder mock. Every chain method returns
 * the same builder, and awaiting it resolves to `result`. Supports the subset
 * of methods used across the app (select/insert/update/upsert/delete/eq/...).
 */
export function makeQueryBuilder(result: MockQueryResult) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  for (const m of [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'neq',
    'not',
    'ilike',
    'order',
    'range',
    'limit',
  ]) {
    builder[m] = jest.fn(chain);
  }
  builder.maybeSingle = jest.fn(async () => result);
  builder.single = jest.fn(async () => result);
  builder.then = (resolve: (v: MockQueryResult) => unknown) => resolve(result);
  return builder;
}

export function makeSupabaseMock(options: {
  user?: { id: string; email?: string } | null;
  tableResult?: MockQueryResult;
}) {
  const tableResult = options.tableResult ?? { data: null, error: null };
  return {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: options.user ?? null },
        error: null,
      })),
    },
    from: jest.fn(() => makeQueryBuilder(tableResult)),
  };
}
