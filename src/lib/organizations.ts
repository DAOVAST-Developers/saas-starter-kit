import { createClient } from '@/lib/supabase/server';
import type { Organization, OrganizationMember } from '@/types/supabase';

export interface OrgMembership {
  organization: Organization;
  role: OrganizationMember['role'];
}

/** All organizations the current user belongs to, with their role. */
export async function getMyOrganizations(): Promise<OrgMembership[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('organization_members')
    .select('role, organizations(*)')
    .eq('user_id', user.id);

  return (data ?? [])
    .filter((row) => row.organizations)
    .map((row) => ({
      organization: row.organizations as unknown as Organization,
      role: row.role,
    }));
}
