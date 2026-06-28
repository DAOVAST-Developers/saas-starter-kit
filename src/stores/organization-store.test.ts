import { useOrganizationStore } from '@/stores/organization-store';

describe('organization store', () => {
  beforeEach(() => {
    useOrganizationStore.setState({ activeOrgId: null });
  });

  it('defaults to no active org', () => {
    expect(useOrganizationStore.getState().activeOrgId).toBeNull();
  });

  it('sets the active org', () => {
    useOrganizationStore.getState().setActiveOrg('org-123');
    expect(useOrganizationStore.getState().activeOrgId).toBe('org-123');
  });

  it('clears the active org', () => {
    useOrganizationStore.getState().setActiveOrg('org-123');
    useOrganizationStore.getState().setActiveOrg(null);
    expect(useOrganizationStore.getState().activeOrgId).toBeNull();
  });
});
