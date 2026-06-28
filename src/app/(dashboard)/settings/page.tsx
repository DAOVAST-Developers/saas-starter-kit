import { getProfile, requireUser } from '@/lib/auth';
import { ProfileForm } from './profile-form';

export default async function SettingsPage() {
  await requireUser();
  const profile = await getProfile();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and account.</p>
      </div>

      <section className="rounded-lg border border-border p-6">
        <h2 className="mb-4 font-medium">Profile</h2>
        <ProfileForm
          initialFullName={profile?.full_name ?? ''}
          initialAvatarUrl={profile?.avatar_url ?? ''}
        />
      </section>

      <section className="rounded-lg border border-red-200 p-6">
        <h2 className="mb-2 font-medium text-red-600">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600">
          Delete account
        </button>
      </section>
    </div>
  );
}
