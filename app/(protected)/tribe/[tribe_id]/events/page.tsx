import EventsPage from "@/app-pages/events"

export default async function TribeEventsPage({ params }: PageProps<'/tribe/[tribe_id]/events'>) {
  const { tribe_id } = await params
  return <EventsPage tribeId={tribe_id} />
}