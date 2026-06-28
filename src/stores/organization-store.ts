import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization } from '@/types/supabase';

export type { Organization };

export interface OrganizationState {
  activeOrgId: string | null;
  currentOrg: Organization | null;
  organizations: Organization[];
  setActiveOrg: (orgId: string | null) => void;
  setCurrentOrg: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
}

/**
 * Tracks the active organization for the current session. Persisted to
 * localStorage so the selection survives reloads.
 */
export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      currentOrg: null,
      organizations: [],
      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),
      setCurrentOrg: (org) =>
        set({ currentOrg: org, activeOrgId: org?.id ?? null }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
    }),
    { name: 'active-organization' },
  ),
);
