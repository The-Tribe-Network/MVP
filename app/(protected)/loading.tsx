import { Muted } from "@/components/ui/typography"

export default function ProtectedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <Muted>Loading...</Muted>
      </div>
    </div>
  )
}
