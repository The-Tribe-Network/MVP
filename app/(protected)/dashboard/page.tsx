import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from '@tanstack/react-query'
import { redirect } from "next/navigation"

import { getServerUser } from "@/lib/services/auth"
import { userActivitiesOptions } from '@/lib/query-options'
import HomeDashboard from "@/app-pages/home-dashboard"

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/sign-in")
  }

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(userActivitiesOptions({ limit: 20 })),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeDashboard user={user} />
    </HydrationBoundary>
  )
}
