import type { PageProps } from '@/.next/types/app/page'
import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/services/auth'
import { getTribeById } from '@/lib/services/tribe'
import { getMemberWithPermissions } from '@/lib/services/permissions'
import { CreateEventPage } from '@/app-pages/create-event'

export default async function NewEventPage({ params }: PageProps) {
  const { tribe_id } = await params

  // 1. Check authentication
  const user = await getServerUser()
  if (!user) {
    redirect(`/sign-in?toast_code=SESSION_EXPIRED`)
  }

  // 2. Check tribe exists
  const tribe = await getTribeById(tribe_id)
  if (!tribe) {
    redirect(`/dashboard?toast_code=TRIBE_NOT_FOUND`)
  }

  // 3. Check membership and permissions
  const memberData = await getMemberWithPermissions(tribe_id, user.id)
  if (!memberData) {
    redirect(`/dashboard?toast_code=UNAUTHORIZED_TRIBE_ACCESS`)
  }

  // 4. Check if user has permission to create events
  // By default: owner, admin, moderator can create events
  // Or if canCreateEvents permission is explicitly set to true
  const canCreateEvents =
    memberData.role === 'owner' ||
    memberData.role === 'admin' ||
    memberData.role === 'moderator' ||
    memberData.permissions?.canCreateEvents === true

  if (!canCreateEvents) {
    redirect(`/tribe/${tribe_id}/events?toast_code=INSUFFICIENT_PERMISSIONS`)
  }

  return <CreateEventPage tribeId={tribe_id} />
}
