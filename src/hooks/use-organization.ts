'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useOrganizationStore } from '@/stores/organization-store';
import type { Organization, OrganizationMember } from '@/types/supabase';

export interface OrgWithRole {
  organization: Organization;
  role: OrganizationMember['role'];
}

/** Fetches the current user's organizations via React Query. */
export function useOrganizations() {
  return useQuery<OrgWithRole[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('organization_members')
        .select('role, organizations(*)');
      if (error) throw error;
      return (data ?? [])
        .filter((row) => row.organizations)
        .map((row) => ({
          organization: row.organizations as unknown as Organization,
          role: row.role,
        }));
    },
  });
}

/** Resolves the currently active organization from the store + fetched list. */
export function useActiveOrganization() {
  const activeOrgId = useOrganizationStore((s) => s.activeOrgId);
  const { data, ...rest } = useOrganizations();
  const active =
    data?.find((o) => o.organization.id === activeOrgId) ?? data?.[0] ?? null;
  return { active, organizations: data ?? [], ...rest };
}
