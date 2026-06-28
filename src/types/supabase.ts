// Convenience row-type aliases derived from the generated Database type.
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

export type Profile = Tables['profiles']['Row'];
export type Organization = Tables['organizations']['Row'];
export type OrganizationMember = Tables['organization_members']['Row'];
export type OrganizationInvitation = Tables['organization_invitations']['Row'];
export type Subscription = Tables['subscriptions']['Row'];
