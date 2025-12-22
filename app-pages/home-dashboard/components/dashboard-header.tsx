import { getFirstName } from '@/lib/utils'

interface DashboardHeaderProps {
  userName?: string | null
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const firstName = getFirstName(userName)

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2">Home</h1>
      <p className="text-muted-foreground">Welcome {firstName} to your home dashboard</p>
    </div>
  )
}

