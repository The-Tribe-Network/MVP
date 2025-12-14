import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/services/auth'
import { getTribeById } from '@/lib/services/tribe'
import { getMemberWithPermissions } from '@/lib/services/permissions'
import CreateAlbumPage from '@/app-pages/create-album'

export default async function NewAlbumPage({ params }: PageProps<'/tribe/[tribe_id]/media/album/new'>) {
  const { tribe_id } = await params

  // // 1. Check authentication
  // const user = await getServerUser()
  // if (!user) {
  //   redirect(`/sign-in?toast_code=SESSION_EXPIRED`)
  // }

  // // 2. Check tribe exists
  // const tribe = await getTribeById(tribe_id)
  // if (!tribe) {
  //   redirect(`/dashboard?toast_code=TRIBE_NOT_FOUND`)
  // }

  // // 3. Check membership and permissions
  // const memberData = await getMemberWithPermissions(tribe_id, user.id)
  // if (!memberData) {
  //   redirect(`/dashboard?toast_code=UNAUTHORIZED_TRIBE_ACCESS`)
  // }

  // // 4. Check if user has permission to create albums
  // const canCreate =
  //   memberData.permissions?.canCreateAlbums === true ||
  //   ['owner', 'admin', 'moderator'].includes(memberData.role)

  // if (!canCreate) {
  //   redirect(`/tribe/${tribe_id}/media?toast_code=INSUFFICIENT_PERMISSIONS`)
  // }

  return <CreateAlbumPage tribeId={tribe_id} />
}