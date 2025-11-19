import { getServerUser } from "@/lib/services/auth"
import HomeDashboard from "@/app-pages/home-dashboard"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getServerUser()

  if (!user) {
    redirect("/sign-in")
  }

  return <HomeDashboard user={user} />
}
