import { CreateEventPage } from '@/app-pages/create-event'

export default async function NewEventPage({ params }: PageProps<'/tribe/[tribe_id]/events/new'>) {
  const { tribe_id } = await params

  return <CreateEventPage tribeId={tribe_id} />
}
