import { InvitationsSettings } from '@/app-pages/tribe-settings/invitations';

export default async function InvitationsSettingsPage({
  params,
}: {
  params: Promise<{ tribe_id: string }>;
}) {
  const { tribe_id } = await params;

  return <InvitationsSettings tribeId={tribe_id} />;
}
