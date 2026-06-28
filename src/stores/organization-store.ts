import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  activeOrgId: string | null;
  setActiveOrg: (orgId: string | null) => void;
}

/**
 * Tracks the active organization for the current session. Persisted to
 * localStorage so the selection survives reloads.
 */
export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      setActiveOrg: (orgId) => set({ activeOrgId: orgId }),
    }),
    { name: 'active-organization' },
  ),
);
